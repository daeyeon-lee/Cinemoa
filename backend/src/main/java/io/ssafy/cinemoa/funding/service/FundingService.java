package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.category.repository.CategoryRepository;
import io.ssafy.cinemoa.category.repository.entity.Category;
import io.ssafy.cinemoa.cinema.repository.CinemaRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenUnavailableTImeBatchRepository;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.dto.FundingCreationResult;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.CategoryInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.CinemaInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.FundingInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.FundingStatInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.ProposerInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.ScreenInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.VideoInfo;
import io.ssafy.cinemoa.funding.dto.VoteCreateRequest;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.funding.event.AccountCreationRequestEvent;
import io.ssafy.cinemoa.funding.event.FundingScoreUpdateEvent;
import io.ssafy.cinemoa.funding.exception.SeatLockException;
import io.ssafy.cinemoa.funding.repository.FundingEstimatedDayRepository;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingEstimatedDay;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.redis.service.RedisService;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundingService {
    private final CategoryRepository categoryRepository;

    private static final String SEAT_RESERVATION_SCRIPT = """
            local fundingId = KEYS[1]
            local userId = KEYS[2]
            local initialSeats = tonumber(ARGV[1])
            local ttl = tonumber(ARGV[2])

            local seatKey = "seat:" .. fundingId .. ":" .. userId
            local remainSeatKey = "remain_seat:" .. fundingId

            -- 잔여 좌석 키가 없는 경우 초기화
            if redis.call("exists", remainSeatKey) == 0 then
                redis.call("set", remainSeatKey, initialSeats)
            end

            local remainSeats = tonumber(redis.call("get", remainSeatKey))

            if remainSeats <= 0 then
                return {0, "NO_SEATS_LEFT", 0}
            end

            -- 사용자가 이미 점유했는지 확인
            if redis.call("exists", seatKey) == 1 then
                return {0, "ALREADY_HOLDING", remainSeats}
            end

            -- 잔여 좌석 1 감소 및 사용자 점유 등록
            redis.call("decr", remainSeatKey)
            redis.call("setex", seatKey, ttl, "true")

            return {1, "SUCCESS", remainSeats - 1}
            """;
    private static final String RELEASE_SEAT_SCRIPT = """
            local fundingId = KEYS[1]
            local userId = KEYS[2]

            local seatKey = "seat:" .. fundingId .. ":" .. userId
            local remainSeatKey = "remain_seat:" .. fundingId

            -- 점유한 좌석이 있는지 확인
            if redis.call("exists", seatKey) == 0 then
                return {0}
            end

            -- 원자적으로 좌석 해제 및 잔여 좌석 수 증가
            redis.call("del", seatKey)
            local remainSeats = redis.call("incr", remainSeatKey)

            return {1}
            """;

    private final ApplicationEventPublisher eventPublisher;
    private final FundingEstimatedDayRepository fundingEstimatedDayRepository;
    private final FundingRepository fundingRepository;
    private final FundingStatRepository statRepository;

    private final ScreenRepository screenRepository;
    private final CinemaRepository cinemaRepository;

    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final RedisService redisService;
    private final ScreenUnavailableTImeBatchRepository unavailableTImeBatchRepository;

    @Transactional
    public FundingCreationResult createFunding(FundingCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(ResourceNotFoundException::ofUser);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(ResourceNotFoundException::ofCategory);

        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(ResourceNotFoundException::ofCinema);

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(ResourceNotFoundException::ofScreen);

        if (!unavailableTImeBatchRepository.insertRangeIfAvailable(screen.getScreenId(), request.getScreenDay(),
                request.getScreenStartsOn(), request.getScreenEndsOn())) {
            throw BadRequestException.ofFunding("사용 불가능한 예약 시간대 입니다.");
        }

        Funding funding = Funding.builder()
                .fundingType(FundingType.FUNDING)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .videoName(request.getVideoName())
                .leader(user)
                .maxPeople(request.getMaxPeople())
                .screenDay(request.getScreenDay())
                .screenStartsOn(request.getScreenStartsOn())
                .screenEndsOn(request.getScreenEndsOn())
                .category(category)
                .state(FundingState.EVALUATING)
                .endsOn(request.getScreenDay().minusDays(7))
                .cinema(cinema)
                .screen(screen)
                .build();

        fundingRepository.save(funding);

        FundingStat fundingStat = FundingStat.builder()
                .funding(funding)
                .build();
        statRepository.save(fundingStat);
        eventPublisher.publishEvent(new AccountCreationRequestEvent(funding.getFundingId()));

        return new FundingCreationResult(funding.getFundingId());
    }

    @Transactional
    public void holdSeatOf(Long userId, Long fundingId) {
        // put seat info on redis, then reduce remaining seats.
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        List<Object> result = redisService.execute(
                RedisScript.of(SEAT_RESERVATION_SCRIPT, List.class),
                Arrays.asList(fundingId.toString(), userId.toString()),
                funding.getMaxPeople().toString(),
                "180");

        Integer success = (Integer) result.get(0);
        String message = (String) result.get(1);

        if (success == 0) {
            switch (message) {
                case "NO_SEATS_LEFT":
                    throw SeatLockException.ofNoRemainingSeat();
                case "ALREADY_HOLDING":
                    throw SeatLockException.ofAlreadyHolding();
            }
        }
    }

    public void unholdSeatOf(Long userId, Long fundingId) {
        List<Object> result = redisService.execute(
                RedisScript.of(RELEASE_SEAT_SCRIPT, List.class),
                Arrays.asList(fundingId.toString(), userId.toString()));

        Integer success = (Integer) result.get(0);
        if (success == 0) {
            throw SeatLockException.ofNotHolding();
        }
    }

    @Transactional
    public void createVote(VoteCreateRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(ResourceNotFoundException::ofUser);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(ResourceNotFoundException::ofCategory);

        Funding vote = Funding.builder()
                .fundingType(FundingType.VOTE)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .videoName(request.getVideoName())
                .leader(user)
                .category(category)
                .maxPeople(0)
                .state(FundingState.EVALUATING)
                .endsOn(LocalDate.from(ZonedDateTime.now(ZoneId.of("Asia/Seoul")).plusDays(14)))
                .build();

        FundingEstimatedDay estimatedDay = new FundingEstimatedDay(null, vote, request.getScreenMinDate(),
                request.getScreenMaxDate());

        fundingRepository.save(vote);

        FundingStat fundingStat = FundingStat.builder()
                .funding(vote)
                .build();
        fundingEstimatedDayRepository.save(estimatedDay);
        statRepository.save(fundingStat);
    }

    @Transactional
    public FundingDetailResponse getFundingDetail(Long fundingId, Long userId) {
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        FundingStat stat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(InternalServerException::ofUnknown);

        Boolean isLiked = userId != null
                && userFavoriteRepository.existsByUser_IdAndFunding_FundingId(userId, fundingId);

        Screen screen = funding.getScreen();
        Cinema cinema = funding.getCinema();
        User proposer = funding.getLeader();

        Category category = funding.getCategory();
        Category parentCategory = category.getParentCategory();

        FundingInfo fundingInfo = FundingInfo.builder()
                .fundingId(funding.getFundingId())
                .progressRate(stat.getParticipantCount() / funding.getMaxPeople() * 100)
                .title(funding.getTitle())
                .bannerUrl(funding.getBannerUrl())
                .content(funding.getContent())
                .state(funding.getState())
                .fundingEndsOn(funding.getEndsOn())
                .price(screen.getPrice() / funding.getMaxPeople())
                .build();

        CategoryInfo categoryInfo = CategoryInfo.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getTagName())
                .parentCategoryId(parentCategory.getCategoryId())
                .parentCategoryName(parentCategory.getTagName())
                .build();

        ProposerInfo proposerInfo = ProposerInfo.builder()
                .proposerId(proposer.getId())
                .nickname(proposer.getNickname())
                .profileImgUrl(proposer.getProfileImgUrl())
                .build();

        VideoInfo videoInfo = VideoInfo.builder()
                .videoName(funding.getVideoName())
                .screenStartsOn(funding.getScreenStartsOn())
                .screenEndsOn(funding.getScreenEndsOn())
                .build();

        FundingStatInfo statInfo = FundingStatInfo.builder()
                .maxPeople(funding.getMaxPeople())
                .isLiked(isLiked)
                .participantCount(stat.getParticipantCount())
                .likeCount(stat.getFavoriteCount())
                .viewCount(stat.getViewCount())
                .build();

        ScreenInfo screenInfo = ScreenInfo.builder()
                .screenId(screen.getScreenId())
                .screenName(screen.getScreenName())
                .is4dx(screen.getIs4dx())
                .isRecliner(screen.getIsRecliner())
                .isScreenx(screen.getIsScreenX())
                .isDolby(screen.getIsDolby())
                .isImax(screen.getIsImax())
                .build();

        CinemaInfo cinemaInfo = CinemaInfo.builder()
                .city(cinema.getCity())
                .cinemaId(cinema.getCinemaId())
                .cinemaName(cinema.getCinemaName())
                .district(cinema.getDistrict())
                .build();

        FundingDetailResponse response = FundingDetailResponse.builder()
                .type(funding.getFundingType())
                .funding(fundingInfo)
                .screening(videoInfo)
                .stat(statInfo)
                .proposer(proposerInfo)
                .screen(screenInfo)
                .category(categoryInfo)
                .cinema(cinemaInfo)
                .build();

        updateViewCount(fundingId);

        eventPublisher.publishEvent(new FundingScoreUpdateEvent(fundingId));
        return response;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    private void updateViewCount(Long fundingId) {
        // DB 전체 조회수 증가
        statRepository.incrementViewCount(fundingId);

        // Redis 버킷에 조회수 카운트 증가
        try {
            redisService.incrementViewBucket(fundingId);
            log.debug("Redis 버킷 조회수 증가: fundingId={}", fundingId);
        } catch (Exception e) {
            log.warn("Redis 버킷 조회수 업데이트 실패: fundingId={}, error={}", fundingId, e.getMessage());
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateFundingAccount(Long fundingId, String accountNo) {
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);
        funding.setFundingAccount(accountNo);
        fundingRepository.saveAndFlush(funding);
    }

    // wilson-score 기반 점수 계산
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recalculateScore(Long fundingId) {
        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(InternalServerException::ofUnknown);

        int views = fundingStat.getViewCount();
        int likes = fundingStat.getFavoriteCount();

        double engagementRate = views > 0 ? (double) likes / views : 0;

        double confidence = calculateWilsonScore(likes, views - likes);

        double viewScore = Math.log(1 + views) / Math.log(1000);

        double finalScore = (confidence * 0.6 + engagementRate * 0.4) * viewScore * 100;

        fundingStat.setRecommendScore(finalScore);
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
