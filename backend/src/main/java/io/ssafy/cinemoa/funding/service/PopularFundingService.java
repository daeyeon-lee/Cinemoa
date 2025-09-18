package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.global.redis.service.RedisService;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PopularFundingService {

  private final RedisService redisService;
  private final FundingRepository fundingRepository;
  private final FundingStatRepository fundingStatRepository;
  private final UserFavoriteRepository userFavoriteRepository;

  /**
   * 상위 10개 인기 상영회 조회 (캐시 우선)
   */
  public List<CardTypeFundingInfoDto> getTopPopularFundings(Long userId) {
    try {
      // 캐시에서 상위 10개 ID 조회
      List<Long> cachedFundingIds = redisService.getCachedTop10FundingIds();

      if (!cachedFundingIds.isEmpty()) {
        log.debug("캐시에서 상위 10개 조회: {} 건", cachedFundingIds.size());
        return cachedFundingIds.stream()
            .map(fundingId -> getCardTypeFundingInfo(userId, fundingId))
            .toList();
      }

      // 캐시가 없으면 실시간 계산
      return getTopPopularFundingsFromRanking(userId);

    } catch (Exception e) {
      log.error("인기 상영회 조회 중 오류 발생", e);
      return new ArrayList<>();
    }
  }

  /**
   * 랭킹 ZSET(:rank)에서 실시간 상위 10개 조회
   */
  private List<CardTypeFundingInfoDto> getTopPopularFundingsFromRanking(Long userId) {
    try {
      List<Object> topFundingIds = redisService.getTop10FundingIds();

      return topFundingIds.stream()
          .map(id -> Long.valueOf(id.toString()))
          .map(fundingId -> getCardTypeFundingInfo(userId, fundingId))
          .toList();

    } catch (Exception e) {
      log.error("랭킹에서 상위 10개 조회 중 오류 발생", e);
      return new ArrayList<>();
    }
  }

  /**
   * 매 30분마다 배치 갱신 (매시 0분, 30분에 실행)
   * 모든 펀딩에 대해 지난 30분 점수를 계산하여 랭킹 업데이트
   */
  @Scheduled(cron = "0 0,30 * * * *")
  public void updatePopularRanking() {
    try {
      log.info("■■■■■■■■ 인기 상영회 랭킹 배치 갱신 시작 ■■■■■■■■");

      // 현재 버킷의 모든 펀딩 ID 수집
      var fundingIds = redisService.getAllFundingIdsInCurrentBucket();

      if (fundingIds.isEmpty()) {
        log.warn("현재 버킷에 활동이 있는 펀딩이 없습니다.");
        return;
      }

      log.info("활동이 있는 펀딩 {}개에 대해 점수 계산을 시작합니다.", fundingIds.size());

      // 기존 랭킹 초기화
      redisService.clearRanking();

      List<Long> top10FundingIds = new ArrayList<>();
      int processedCount = 0;

      // 각 펀딩에 대해 점수 계산 및 랭킹 업데이트
      for (String fundingIdStr : fundingIds) {
        try {
          Long fundingId = Long.parseLong(fundingIdStr);

          // 지난 30분 동안의 조회수와 좋아요 수 조회
          int views = redisService.getViewsInLast30Minutes(fundingId);
          int likes = redisService.getLikesInLast30Minutes(fundingId);

          // wilson-score 기반 점수 계산
          double score = getWilsonScore(views, likes);

          if (score > 0) {
            // 랭킹 ZSET에 점수 업데이트
            redisService.updateRankingScore(fundingId, score);

            log.debug("펀딩 {} 점수 업데이트: views={}, likes={}, score={}",
                fundingId, views, likes, score);

            processedCount++;
          }

        } catch (Exception e) {
          log.warn("펀딩 {} 점수 계산 중 오류: {}", fundingIdStr, e.getMessage());
        }
      }

      // 상위 10개 ID 조회 및 캐시 저장
      List<Object> top10Objects = redisService.getTop10FundingIds();
      if (!top10Objects.isEmpty()) {
        top10FundingIds = top10Objects.stream()
            .map(id -> Long.valueOf(id.toString()))
            .toList();

        // 상위 10개 캐시 저장
        redisService.cacheTop10FundingIds(top10FundingIds);

        log.info("■■■■■■■■ 인기 상영회 랭킹 배치 갱신 완료 ■■■■■■■■");
        log.info("처리된 펀딩: {} 개, 상위 10개 캐시 저장 완료", processedCount);

        // 상위 10개 로그 출력
        log.info("상위 10개 펀딩 ID: {}", top10FundingIds);

      } else {
        log.warn("랭킹에 데이터가 없습니다.");
      }

    } catch (Exception e) {
      log.error("인기 상영회 랭킹 배치 갱신 중 오류 발생", e);
    }
  }

  /**
   * 펀딩 ID로 CardTypeFundingInfoDto 생성
   */
  private CardTypeFundingInfoDto getCardTypeFundingInfo(Long userId, Long fundingId) {
    try {
      // 펀딩 정보 조회
      Funding funding = fundingRepository.findById(fundingId)
          .orElseThrow(ResourceNotFoundException::ofFunding);

      // 펀딩 통계 정보 조회
      FundingStat stat = fundingStatRepository.findByFunding_FundingId(fundingId)
          .orElseThrow(InternalServerException::ofUnknown);

      // 좋아요 여부 확인
      Boolean isLiked = userId != null
          && userFavoriteRepository.existsByUser_IdAndFunding_FundingId(userId, fundingId);

      // 진행률 계산
      int progressRate = funding.getMaxPeople() > 0
          ? (stat.getParticipantCount() * 100 / funding.getMaxPeople())
          : 0;

      // 1인당 가격 계산
      Integer perPersonPrice = funding.getMaxPeople() > 0
          ? funding.getScreen().getPrice() / funding.getMaxPeople()
          : -1;

      // BriefFundingInfo 생성
      CardTypeFundingInfoDto.BriefFundingInfo fundingInfo = CardTypeFundingInfoDto.BriefFundingInfo.builder()
          .fundingId(funding.getFundingId())
          .title(funding.getTitle())
          .bannerUrl(funding.getBannerUrl())
          .state(funding.getState())
          .progressRate(progressRate)
          .fundingEndsOn(funding.getEndsOn())
          .videoName(funding.getVideoName())
          .screenDate(funding.getScreenDay())
          .screenMinDate(funding.getScreenDay())
          .screenMaxDate(funding.getScreenDay())
          .price(perPersonPrice)
          .maxPeople(funding.getMaxPeople())
          .viewCount(stat.getViewCount())
          .participantCount(stat.getParticipantCount())
          .favoriteCount(stat.getFavoriteCount())
          .isLiked(isLiked)
          .fundingType(funding.getFundingType().toString())
          .build();

      // BriefCinemaInfo 생성
      CardTypeFundingInfoDto.BriefCinemaInfo cinemaInfo = CardTypeFundingInfoDto.BriefCinemaInfo.builder()
          .cinemaId(funding.getCinema().getCinemaId())
          .cinemaName(funding.getCinema().getCinemaName())
          .city(funding.getCinema().getCity())
          .district(funding.getCinema().getDistrict())
          .build();

      // CardTypeFundingInfoDto 생성
      return CardTypeFundingInfoDto.builder()
          .funding(fundingInfo)
          .cinema(cinemaInfo)
          .build();

    } catch (Exception e) {
      log.error("펀딩 정보 조회 중 오류 발생: fundingId={}, error={}", fundingId, e.getMessage());
      throw new RuntimeException("펀딩 정보를 조회할 수 없습니다.", e);
    }
  }

  private double getWilsonScore(int views, int likes) {
    double engagementRate = views > 0 ? (double) likes / views : 0;
    double confidence = calculateWilsonScore(likes, views - likes);
    double viewScore = Math.log(1 + views) / Math.log(1000);
    double finalScore = (confidence * 0.6 + engagementRate * 0.4) * viewScore * 100;
    return finalScore;
  }

  private double calculateWilsonScore(int positive, int negative) {
    int total = positive + negative;
    if (total == 0) {
      return 0;
    }

    double p = (double) positive / total;
    double z = 1.96; // 95% 신뢰구간

    return (p + z * z / (2 * total) - z * Math.sqrt((p * (1 - p) + z * z / (4 * total)) / total))
        / (1 + z * z / total);
  }

}
