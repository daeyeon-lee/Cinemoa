package io.ssafy.cinemoa.favorite.service;

import io.ssafy.cinemoa.favorite.exception.FavoriteException;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.favorite.repository.entity.UserFavorite;
import io.ssafy.cinemoa.favorite.repository.entity.UserFavoriteId;
import io.ssafy.cinemoa.funding.event.FundingScoreUpdateEvent;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.redis.service.RedisService;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class FundingFavoriteService {

    private final ApplicationEventPublisher eventPublisher;
    private final UserFavoriteRepository userFavoriteRepository;

    private final FundingRepository fundingRepository;
    private final FundingStatRepository statRepository;
    private final UserRepository userRepository;

    private final RedisService redisService;

    @Transactional
    public void like(Long userId, Long fundingId) {

        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        User user = userRepository.findById(userId).orElseThrow(ResourceNotFoundException::ofUser);
        UserFavoriteId id = new UserFavoriteId(userId, fundingId);

        if (userFavoriteRepository.existsById(id)) {
            throw FavoriteException.ofLikeExists();
        }

        UserFavorite userFavorite = UserFavorite.builder()
                .id(id)
                .funding(funding)
                .user(user)
                .build();

        userFavoriteRepository.save(userFavorite);

        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(InternalServerException::ofUnknown);

        statRepository.incrementFavoriteCount(fundingId);

        // Redis 버킷에 좋아요 카운트 증가
        try {
            redisService.incrementLikeBucket(fundingId);
            log.debug("Redis 버킷 좋아요 증가: fundingId={}", fundingId);
        } catch (Exception e) {
            log.warn("Redis 버킷 좋아요 업데이트 실패: fundingId={}, error={}", fundingId, e.getMessage());
        }

        eventPublisher.publishEvent(new FundingScoreUpdateEvent(fundingId));
    }

    @Transactional
    public void unlike(Long userId, Long fundingId) {
        UserFavoriteId id = new UserFavoriteId(userId, fundingId);

        if (!userFavoriteRepository.existsById(id)) {
            throw FavoriteException.ofLikeDoesntExists();
        }

        userFavoriteRepository.deleteById(id);

        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(InternalServerException::ofUnknown);

        fundingStat.setFavoriteCount(fundingStat.getFavoriteCount() - 1);

        // Redis 버킷에서 좋아요 카운트 감소
        try {
            redisService.decrementLikeBucket(fundingId);
            log.debug("Redis 버킷 좋아요 감소: fundingId={}", fundingId);
        } catch (Exception e) {
            log.warn("Redis 버킷 좋아요 감소 실패: fundingId={}, error={}", fundingId, e.getMessage());
        }

        eventPublisher.publishEvent(new FundingScoreUpdateEvent(fundingId));
    }
}
