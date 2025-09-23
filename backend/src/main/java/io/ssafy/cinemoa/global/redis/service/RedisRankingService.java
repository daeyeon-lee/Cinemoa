package io.ssafy.cinemoa.global.redis.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisRankingService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;

    // Redis 키 prefix
    private static final String FUNDING_VIEWS_BUCKET_PREFIX = "funding:views:bucket:";
    private static final String FUNDING_LIKES_BUCKET_PREFIX = "funding:likes:bucket:";
    private static final String FUNDING_RANK_KEY = "funding:rank:24h";
    private static final String FUNDING_TOP10_CACHE_KEY = "funding:top10:24h";

    // ===== 24시간 윈도우 30분 단위 버킷 시스템 =====

    /**
     * 현재 시간을 30분 단위로 내림 처리하여 버킷 키 생성
     * 예: 14:17 → 14:00, 14:45 → 14:30
     */
    private String getCurrentBucketKey(String prefix) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime bucketTime = now.withMinute((now.getMinute() / 30) * 30).withSecond(0).withNano(0);
        return prefix + bucketTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
    }

    /**
     * 조회수 버킷에 카운트 증가
     */
    public void incrementViewBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey(FUNDING_VIEWS_BUCKET_PREFIX);
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), 1);
        redisTemplate.expire(bucketKey, Duration.ofHours(25)); // 24시간 + 1시간 여유분
    }

    /**
     * 좋아요 버킷에 카운트 증가
     */
    public void incrementLikeBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey(FUNDING_LIKES_BUCKET_PREFIX);
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), 1);
        redisTemplate.expire(bucketKey, Duration.ofHours(25)); // 24시간 + 1시간 여유분
    }

    /**
     * 좋아요 버킷에서 카운트 감소
     */
    public void decrementLikeBucket(Long fundingId) {
        String bucketKey = getCurrentBucketKey(FUNDING_LIKES_BUCKET_PREFIX);
        redisTemplate.opsForHash().increment(bucketKey, fundingId.toString(), -1);
        redisTemplate.expire(bucketKey, Duration.ofHours(25)); // 24시간 + 1시간 여유분
    }

    /**
     * 지난 24시간 동안의 조회수 합계 조회
     */
    public int getViewsInLast24Hours(Long fundingId) {
        int totalViews = 0;
        LocalDateTime now = LocalDateTime.now();

        // 지난 24시간 동안의 모든 30분 버킷들을 순회
        for (int i = 0; i < 48; i++) { // 24시간 / 30분 = 48개 버킷
            LocalDateTime bucketTime = now.minusMinutes(30L * i) // 현재 시간 ~ 23시간 30분 전
                    .withMinute((now.minusMinutes(30L * i).getMinute() / 30) * 30) // 30분 단위로 정규화
                    .withSecond(0).withNano(0);

            String bucketKey = FUNDING_VIEWS_BUCKET_PREFIX
                    + bucketTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
            Object count = redisTemplate.opsForHash().get(bucketKey, fundingId.toString());
            if (count != null) {
                totalViews += Integer.parseInt(count.toString());
            }
        }

        return totalViews;
    }

    /**
     * 지난 24시간 동안의 좋아요 수 합계 조회
     */
    public int getLikesInLast24Hours(Long fundingId) {
        int totalLikes = 0;
        LocalDateTime now = LocalDateTime.now();

        // 지난 24시간 동안의 모든 30분 버킷들을 순회
        for (int i = 0; i < 48; i++) { // 24시간 / 30분 = 48개 버킷
            LocalDateTime bucketTime = now.minusMinutes(30L * i)
                    .withMinute((now.minusMinutes(30L * i).getMinute() / 30) * 30)
                    .withSecond(0).withNano(0);

            String bucketKey = FUNDING_LIKES_BUCKET_PREFIX
                    + bucketTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
            Object count = redisTemplate.opsForHash().get(bucketKey, fundingId.toString());
            if (count != null) {
                totalLikes += Integer.parseInt(count.toString());
            }
        }

        return totalLikes;
    }

    /**
     * 지난 24시간 동안의 모든 버킷에서 펀딩 ID 조회
     */
    public Set<String> getAllFundingIdsInLast24Hours() {
        Set<String> fundingIds = new HashSet<>();
        LocalDateTime now = LocalDateTime.now();

        // 지난 24시간 동안의 모든 30분 버킷들을 순회
        for (int i = 0; i < 48; i++) { // 24시간 / 30분 = 48개 버킷
            LocalDateTime bucketTime = now.minusMinutes(30L * i)
                    .withMinute((now.minusMinutes(30L * i).getMinute() / 30) * 30)
                    .withSecond(0).withNano(0);

            // 조회수 버킷에서 펀딩 ID 수집
            String viewsBucketKey = FUNDING_VIEWS_BUCKET_PREFIX
                    + bucketTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
            Set<Object> viewKeys = redisTemplate.opsForHash().keys(viewsBucketKey);
            if (viewKeys != null) {
                viewKeys.forEach(key -> fundingIds.add(key.toString()));
            }

            // 좋아요 버킷에서 펀딩 ID 수집
            String likesBucketKey = FUNDING_LIKES_BUCKET_PREFIX
                    + bucketTime.format(DateTimeFormatter.ofPattern("yyyyMMddHHmm"));
            Set<Object> likeKeys = redisTemplate.opsForHash().keys(likesBucketKey);
            if (likeKeys != null) {
                likeKeys.forEach(key -> fundingIds.add(key.toString()));
            }
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
        try {
            String jsonString = objectMapper.writeValueAsString(fundingIds);
            redisTemplate.opsForValue().set(FUNDING_TOP10_CACHE_KEY, jsonString, Duration.ofMinutes(35));
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize funding IDs to JSON: {}", fundingIds, e);
        }
    }

    /**
     * 상위 10개 캐시 조회
     */
    public List<Long> getCachedTop10FundingIds() {
        Object cached = redisTemplate.opsForValue().get(FUNDING_TOP10_CACHE_KEY);

        if (cached == null) {
            return new ArrayList<>();
        }

        try {
            String jsonString = cached.toString();
            return objectMapper.readValue(jsonString, new TypeReference<List<Long>>() {
            });
        } catch (JsonProcessingException e) {
            log.error("Failed to deserialize funding IDs from JSON: {}", cached, e);
            return new ArrayList<>();
        }
    }

    /**
     * 랭킹 ZSET 초기화
     */
    public void clearRanking() {
        redisTemplate.delete(FUNDING_RANK_KEY);
    }
}
