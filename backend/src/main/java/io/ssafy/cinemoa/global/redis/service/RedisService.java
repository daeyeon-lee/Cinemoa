package io.ssafy.cinemoa.global.redis.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    // Redis 키 prefix 상수들
    private static final String FUNDING_VIEWS_BUCKET_PREFIX = "funding:views:bucket:";
    private static final String FUNDING_LIKES_BUCKET_PREFIX = "funding:likes:bucket:";
    private static final String FUNDING_RANK_KEY = "funding:rank:30m";
    private static final String FUNDING_TOP10_CACHE_KEY = "funding:top10:30m";

    public <T> void setValue(String key, T value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public <T> void setValue(String key, T value, Duration duration) {
        redisTemplate.opsForValue().set(key, value, duration);
    }

    public <T> Boolean setValueIfAbsent(String key, T value, Duration duration) {
        return redisTemplate.opsForValue().setIfAbsent(key, value, duration);
    }

    public <T> Boolean setValueIfAbsent(String key, T value) {
        return redisTemplate.opsForValue().setIfAbsent(key, value);
    }

    public <T> T getValue(T key) {
        return (T) redisTemplate.opsForValue().get(key);
    }

    public Boolean removeKey(String key) {
        return redisTemplate.delete(key);
    }

    public void decreaseValue(String string) {
        redisTemplate.opsForValue().decrement(string);
    }

    public List<Object> execute(RedisScript<List> script, List<String> keys, Object... args) {
        return redisTemplate.execute(script, keys, args);
    }

    // ===== 고정 30분 윈도우 버킷 시스템 =====

    /**
     * 현재 시간을 30분 단위로 내림 처리하여 버킷 키 생성
     * 예: 14:17 → 14:00, 14:45 → 14:30
     */
    private String getCurrentBucketKey(String prefix) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);
        return prefix + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
    }

    /**
     * 조회수 버킷에 카운트 증가
     */
    public void incrementViewBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey(FUNDING_VIEWS_BUCKET_PREFIX);
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), 1);
        redisTemplate.expire(bucketKey, Duration.ofMinutes(35)); // 여유분 포함
    }

    /**
     * 좋아요 버킷에 카운트 증가
     */
    public void incrementLikeBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey(FUNDING_LIKES_BUCKET_PREFIX);
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), 1);
        redisTemplate.expire(bucketKey, Duration.ofMinutes(35)); // 여유분 포함
    }

    /**
     * 좋아요 버킷에서 카운트 감소
     */
    public void decrementLikeBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey(FUNDING_LIKES_BUCKET_PREFIX);
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), -1);
        redisTemplate.expire(bucketKey, Duration.ofMinutes(35)); // 여유분 포함
    }

    /**
     * 지난 30분 동안의 조회수 합계 조회
     */
    public int getViewsInLast30Minutes(Long fundingId) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);
        String bucketKey = FUNDING_VIEWS_BUCKET_PREFIX
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));

        Object count = redisTemplate.opsForHash().get(bucketKey, fundingId.toString());
        return count != null ? Integer.parseInt(count.toString()) : 0;
    }

    /**
     * 지난 30분 동안의 좋아요 수 합계 조회
     */
    public int getLikesInLast30Minutes(Long fundingId) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);
        String bucketKey = FUNDING_LIKES_BUCKET_PREFIX
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));

        Object count = redisTemplate.opsForHash().get(bucketKey, fundingId.toString());
        return count != null ? Integer.parseInt(count.toString()) : 0;
    }

    /**
     * 현재 버킷의 모든 펀딩 ID 조회
     */
    public Set<String> getAllFundingIdsInCurrentBucket() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);

        Set<String> fundingIds = new HashSet<>();

        // 조회수 버킷에서 펀딩 ID 수집
        String viewsBucketKey = FUNDING_VIEWS_BUCKET_PREFIX
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        Set<Object> viewKeys = redisTemplate.opsForHash().keys(viewsBucketKey);
        if (viewKeys != null) {
            viewKeys.forEach(key -> fundingIds.add(key.toString()));
        }

        // 좋아요 버킷에서 펀딩 ID 수집
        String likesBucketKey = FUNDING_LIKES_BUCKET_PREFIX
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        Set<Object> likeKeys = redisTemplate.opsForHash().keys(likesBucketKey);
        if (likeKeys != null) {
            likeKeys.forEach(key -> fundingIds.add(key.toString()));
        }

        return fundingIds;
    }

    /**
     * 랭킹 ZSET에 점수 업데이트
     */
    public void updateRankingScore(Long fundingId, double score) {
        redisTemplate.opsForZSet().add(FUNDING_RANK_KEY, fundingId, score);
    }

    /**
     * 상위 10개 펀딩 ID 조회
     */
    public List<Long> getTop10FundingIds() {
        Set<Object> result = redisTemplate.opsForZSet().reverseRange(FUNDING_RANK_KEY, 0, 9);
        if (result == null) {
            return Collections.emptyList();
        }

        return result.stream()
                .map(obj -> Long.valueOf(obj.toString()))
                .toList();
    }

    /**
     * 상위 10개 캐시 저장
     */
    public void cacheTop10FundingIds(List<Long> fundingIds) {
        String jsonString = fundingIds.toString(); // [1, 2, 3] 형태 (JSON 문자열로 저장)
        redisTemplate.opsForValue().set(FUNDING_TOP10_CACHE_KEY, jsonString, Duration.ofMinutes(10));
    }

    /**
     * 상위 10개 캐시 조회
     */
    public List<Long> getCachedTop10FundingIds() {
        Object cached = redisTemplate.opsForValue().get(FUNDING_TOP10_CACHE_KEY);
        List<Long> result = new ArrayList<>();

        if (cached == null) {
            return result;
        }

        try {
            // JSON 문자열을 파싱하여 Long 리스트로 변환
            String jsonString = cached.toString();
            // [1, 2, 3] 형태의 문자열을 파싱
            jsonString = jsonString.replaceAll("[\\[\\]\\s]", ""); // [ ] 공백 제거
            if (jsonString.isEmpty()) {
                return result;
            }

            String[] parts = jsonString.split(",");
            for (String part : parts) {
                result.add(Long.parseLong(part.trim()));
            }
            return result;
        } catch (Exception e) {
            // 파싱 실패 시 빈 리스트 반환
            return new ArrayList<>();
        }
    }

    /**
     * 랭킹 ZSET 초기화
     */
    public void clearRanking() {
        redisTemplate.delete(FUNDING_RANK_KEY);
    public boolean exists(String seatKey) {
        return redisTemplate.hasKey(seatKey);
    }
}
