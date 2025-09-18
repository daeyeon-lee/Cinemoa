package io.ssafy.cinemoa.global.redis.service;

import java.time.Duration;
import java.util.ArrayList;
import java.util.Collections;
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
        String bucketKey = getCurrentBucketKey("app:funding:views:bucket:");
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), 1);
        redisTemplate.expire(bucketKey, Duration.ofMinutes(35)); // 여유분 포함
    }

    /**
     * 좋아요 버킷에 카운트 증가
     */
    public void incrementLikeBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey("app:funding:likes:bucket:");
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), 1);
        redisTemplate.expire(bucketKey, Duration.ofMinutes(35)); // 여유분 포함
    }

    /**
     * 좋아요 버킷에서 카운트 감소
     */
    public void decrementLikeBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey("app:funding:likes:bucket:");
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), -1);
        redisTemplate.expire(bucketKey, Duration.ofMinutes(35)); // 여유분 포함
    }

    /**
     * 지난 30분 동안의 조회수 합계 조회
     */
    public int getViewsInLast30Minutes(Long fundingId) {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);
        String bucketKey = "app:funding:views:bucket:"
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
        String bucketKey = "app:funding:likes:bucket:"
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));

        Object count = redisTemplate.opsForHash().get(bucketKey, fundingId.toString());
        return count != null ? Integer.parseInt(count.toString()) : 0;
    }

    /**
     * 현재 버킷의 모든 펀딩 ID 조회
     */
    public java.util.Set<String> getAllFundingIdsInCurrentBucket() {
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        java.time.LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);

        java.util.Set<String> fundingIds = new java.util.HashSet<>();

        // 조회수 버킷에서 펀딩 ID 수집
        String viewsBucketKey = "app:funding:views:bucket:"
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        java.util.Set<Object> viewKeys = redisTemplate.opsForHash().keys(viewsBucketKey);
        if (viewKeys != null) {
            viewKeys.forEach(key -> fundingIds.add(key.toString()));
        }

        // 좋아요 버킷에서 펀딩 ID 수집
        String likesBucketKey = "app:funding:likes:bucket:"
                + bucketTime.format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
        java.util.Set<Object> likeKeys = redisTemplate.opsForHash().keys(likesBucketKey);
        if (likeKeys != null) {
            likeKeys.forEach(key -> fundingIds.add(key.toString()));
        }

        return fundingIds;
    }

    /**
     * 랭킹 ZSET에 점수 업데이트
     */
    public void updateRankingScore(Long fundingId, double score) {
        redisTemplate.opsForZSet().add("app:funding:rank:30m", fundingId, score);
    }

    /**
     * 상위 10개 펀딩 ID 조회
     */
    public java.util.List<Object> getTop10FundingIds() {
        Set<Object> result = redisTemplate.opsForZSet().reverseRange("app:funding:rank:30m", 0, 9);
        return result != null ? new ArrayList<>(result) : Collections.emptyList();
    }

    /**
     * 상위 10개 캐시 저장
     */
    public void cacheTop10FundingIds(java.util.List<Long> fundingIds) {
        String cacheKey = "app:funding:top10:30m";
        redisTemplate.opsForValue().set(cacheKey, fundingIds, Duration.ofMinutes(10));
    }

    /**
     * 상위 10개 캐시 조회
     */
    @SuppressWarnings("unchecked")
    public java.util.List<Long> getCachedTop10FundingIds() {
        String cacheKey = "app:funding:top10:30m";
        Object cached = redisTemplate.opsForValue().get(cacheKey);
        return cached != null ? (java.util.List<Long>) cached : new java.util.ArrayList<>();
    }

    /**
     * 랭킹 ZSET 초기화
     */
    public void clearRanking() {
        redisTemplate.delete("app:funding:rank:30m");
    }
}
