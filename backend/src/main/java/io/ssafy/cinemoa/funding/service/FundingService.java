package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.category.repository.CategoryRepository;
import io.ssafy.cinemoa.category.repository.entity.Category;
import io.ssafy.cinemoa.cinema.repository.CinemaRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenUnavailableTImeBatchRepository;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.external.text.client.GPTApiClient;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
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
import io.ssafy.cinemoa.funding.dto.VideoContentRequest;
import io.ssafy.cinemoa.funding.dto.VideoContentResult;
import io.ssafy.cinemoa.funding.dto.VoteCreateRequest;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.funding.event.AccountCreationRequestEvent;
import io.ssafy.cinemoa.funding.event.FundingScoreUpdateEvent;
import io.ssafy.cinemoa.funding.exception.SeatLockException;
import io.ssafy.cinemoa.funding.repository.FundingEstimatedDayRepository;
import io.ssafy.cinemoa.funding.repository.FundingListRepository;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingEstimatedDay;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.redis.service.RedisRankingService;
import io.ssafy.cinemoa.global.redis.service.RedisService;
import io.ssafy.cinemoa.image.dto.AnimateTask;
import io.ssafy.cinemoa.image.enums.ImageCategory;
import io.ssafy.cinemoa.image.event.AnimateDoneEvent;
import io.ssafy.cinemoa.image.service.ImageService;
import io.ssafy.cinemoa.notification.service.FundingNotificationService;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.UserTransactionRepository;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundingService {
    private static final String SEAT_RESERVATION_SCRIPT = """
            local fundingId = KEYS[1]
                    local userId = KEYS[2]
                    local availableSeats = tonumber(ARGV[1])
                    local ttl = tonumber(ARGV[2])
            
                    local seatKey = "seat:" .. fundingId .. ":" .. userId
            
                    -- 사용자가 이미 점유했는지 확인
                    if redis.call("exists", seatKey) == 1 then
                        return {0, "ALREADY_HOLDING"}
                    end
            
                    -- 현재 점유중인 좌석 수 확인
                    local pattern = "seat:" .. fundingId .. ":*"
                    local occupiedSeats = #(redis.call("keys", pattern))
            
                    if occupiedSeats >= availableSeats then
                        return {0, "NO_SEATS_LEFT"}
                    end
            
                    -- 사용자 점유 등록
                    redis.call("setex", seatKey, ttl, "reserved")
            
                    return {1, "SUCCESS"}
            """;
    private static final String RELEASE_SEAT_SCRIPT = """
            local fundingId = KEYS[1]
            local userId = KEYS[2]
            
            local seatKey = "seat:" .. fundingId .. ":" .. userId
            
            -- 점유한 좌석이 있는지 확인
            if redis.call("exists", seatKey) == 0 then
                return {0}
            end
            
            redis.call("del",seatKey")
            
            return {1}
            """;
    private final CategoryRepository categoryRepository;
    private final FundingEstimatedDayRepository fundingEstimatedDayRepository;
    private final FundingRepository fundingRepository;
    private final FundingStatRepository statRepository;
    private final FundingListRepository fundingListRepository;
    private final ScreenRepository screenRepository;
    private final CinemaRepository cinemaRepository;
    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final UserTransactionRepository userTransactionRepository;
    private final ScreenUnavailableTImeBatchRepository unavailableTImeBatchRepository;

    private final ImageService imageService;
    private final RedisService redisService;
    private final RedisRankingService redisRankingService;
    private final FundingNotificationService fundingNotificationService;

    private final ApplicationEventPublisher eventPublisher;

    private final GPTApiClient openAiApiClient;

    @Transactional
    public FundingCreationResult createFunding(MultipartFile image, FundingCreateRequest request) {
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

        log.info("받은 이미지가 존재하는지? : {} 사이즈 : {}", image != null, image != null ? image.getSize() : 0);
        if (image != null) {
            String localPath = imageService.saveImage(image, ImageCategory.BANNER);
            String imagePath = imageService.translatePath(localPath);
            request.setPosterUrl(imagePath);
        }

        Funding funding = Funding.builder()
                .fundingType(FundingType.FUNDING)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .videoName(request.getVideoName())
                .videoContent(request.getVideoContent())
                .leader(user)
                .maxPeople(request.getMaxPeople())
                .screenDay(request.getScreenDay())
                .screenStartsOn(request.getScreenStartsOn())
                .screenEndsOn(request.getScreenEndsOn())
                .category(category)
                .state(FundingState.ON_PROGRESS)
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
    public FundingCreationResult convertToFunding(Long fundingId, FundingCreateRequest request) {

        // 입력값 검증
        userRepository.findById(request.getUserId())
                .orElseThrow(ResourceNotFoundException::ofUser);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(ResourceNotFoundException::ofCategory);

        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(ResourceNotFoundException::ofCinema);

        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(ResourceNotFoundException::ofScreen);

        // 기존 Funding 조회
        Funding existingFunding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // 기존 FundingEstimatedDay 레코드 삭제
        FundingEstimatedDay existingEstimatedDay = fundingEstimatedDayRepository.findByFunding_FundingId(fundingId);
        if (existingEstimatedDay != null) {
            fundingEstimatedDayRepository.delete(existingEstimatedDay);
        }

        // 상영관 예약시간 저장
        if (!unavailableTImeBatchRepository.insertRangeIfAvailable(screen.getScreenId(), request.getScreenDay(),
                request.getScreenStartsOn(), request.getScreenEndsOn())) {
            throw BadRequestException.ofFunding("사용 불가능한 예약 시간대 입니다.");
        }

        // 기존 Funding의 필요한 컬럼들만 수정
        existingFunding.setTitle(request.getTitle());
        existingFunding.setContent(request.getContent());
        existingFunding.setMaxPeople(request.getMaxPeople());
        existingFunding.setScreenDay(request.getScreenDay());
        existingFunding.setScreenStartsOn(request.getScreenStartsOn());
        existingFunding.setScreenEndsOn(request.getScreenEndsOn());
        existingFunding.setCategory(category);
        existingFunding.setCinema(cinema);
        existingFunding.setScreen(screen);
        existingFunding.setState(FundingState.ON_PROGRESS);
        existingFunding.setEndsOn(request.getScreenDay().minusDays(7));
        existingFunding.setFundingType(FundingType.FUNDING);

        // 수정된 Funding 저장
        fundingRepository.save(existingFunding);

        eventPublisher.publishEvent(new AccountCreationRequestEvent(existingFunding.getFundingId()));

        // 투표 → 펀딩 전환 알림 전송
        fundingNotificationService.notifyVoteToFunding(existingFunding);

        return new FundingCreationResult(existingFunding.getFundingId());
    }

    @Transactional
    public void holdSeatOf(Long userId, Long fundingId) {
        // put seat info on redis, then reduce remaining seats.
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        int availableSeats = funding.getMaxPeople() - fundingStat.getParticipantCount();

        if (availableSeats <= 0) {
            throw SeatLockException.ofNoRemainingSeat();
        }

        List<Object> result = redisService.execute(
                RedisScript.of(SEAT_RESERVATION_SCRIPT, List.class),
                Arrays.asList(fundingId.toString(), userId.toString()),
                String.valueOf(availableSeats),
                "180");

        Long success = (Long) result.get(0);
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
    public void createVote(MultipartFile image, VoteCreateRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(ResourceNotFoundException::ofUser);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(ResourceNotFoundException::ofCategory);

        Cinema cinema = cinemaRepository.findById(request.getCinemaId())
                .orElseThrow(ResourceNotFoundException::ofCinema);

        log.info("받은 이미지가 존재하는지? : {} 사이즈 : {}", image != null, image != null ? image.getSize() : 0);

        if (image != null) {
            String localPath = imageService.saveImage(image, ImageCategory.BANNER);
            String imagePath = imageService.translatePath(localPath);
            request.setPosterUrl(imagePath);
        }

        Funding vote = Funding.builder()
                .fundingType(FundingType.VOTE)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .cinema(cinema)
                .videoName(request.getVideoName())
                .videoContent(request.getVideoContent())
                .leader(user)
                .category(category)
                .maxPeople(0)
                .state(FundingState.ON_PROGRESS)
                .endsOn(LocalDate.from(ZonedDateTime.now(ZoneId.of("Asia/Seoul")).plusDays(5)))
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

        Boolean isParticipated = userId != null
                && userTransactionRepository.existsByFunding_FundingIdAndUser_IdAndState(fundingId, userId,
                UserTransactionState.SUCCESS);

        Screen screen = funding.getScreen();
        Cinema cinema = funding.getCinema();
        User proposer = funding.getLeader();

        Category category = funding.getCategory();
        Category parentCategory = category.getParentCategory();
        int price = 0;
        int progressRate = 0;
        if (funding.getMaxPeople() != 0) {
            price = (int) Math.ceil((double) screen.getPrice() / funding.getMaxPeople() / 10) * 10;
            progressRate = stat.getParticipantCount() * 100 / funding.getMaxPeople();
        }

        FundingEstimatedDay estimatedDay = fundingEstimatedDayRepository.findByFunding_FundingId(fundingId);

        FundingInfo fundingInfo = FundingInfo.builder()
                .fundingId(funding.getFundingId())
                .progressRate(progressRate)
                .title(funding.getTitle())
                .bannerUrl(funding.getBannerUrl())
                .content(funding.getContent())
                .state(funding.getState())
                .screenDate(funding.getScreenDay())
                .fundingEndsOn(funding.getEndsOn())
                .price(price)
                .build();

        if (estimatedDay != null) {
            fundingInfo.setScreenMinDate(estimatedDay.getMinDate());
            fundingInfo.setScreenMaxDate(estimatedDay.getMaxDate());
        }

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
                .videoContent(funding.getVideoContent())
                .screenStartsOn(funding.getScreenStartsOn())
                .screenEndsOn(funding.getScreenEndsOn())
                .build();

        FundingStatInfo statInfo = FundingStatInfo.builder()
                .maxPeople(funding.getMaxPeople())
                .isLiked(isLiked)
                .isParticipated(isParticipated)
                .participantCount(stat.getParticipantCount())
                .likeCount(stat.getFavoriteCount())
                .viewCount(stat.getViewCount())
                .build();

        ScreenInfo screenInfo = null;

        if (screen != null) {
            screenInfo = ScreenInfo.builder()
                    .screenId(screen.getScreenId())
                    .screenName(screen.getScreenName())
                    .is4dx(screen.getIs4dx())
                    .isRecliner(screen.getIsRecliner())
                    .isScreenx(screen.getIsScreenX())
                    .isDolby(screen.getIsDolby())
                    .isImax(screen.getIsImax())
                    .build();
        }

        CinemaInfo cinemaInfo = CinemaInfo.builder()
                .city(cinema.getCity())
                .cinemaId(cinema.getCinemaId())
                .cinemaName(cinema.getCinemaName())
                .district(cinema.getDistrict())
                .address(cinema.getAddress())
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

        updateViewCount(fundingId, funding.getFundingType());

        eventPublisher.publishEvent(new FundingScoreUpdateEvent(fundingId));
        return response;
    }

    @Transactional
    public List<CardTypeFundingInfoDto> getFundingList(List<Long> fundingIds, Long userId) {

        // 중복 제거 및 유효성 검사
        List<Long> uniqueIds = fundingIds.stream()
                .distinct()
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        if (uniqueIds.isEmpty()) {
            return Collections.emptyList();
        }
        // 최대 10개로 제한
        if (uniqueIds.size() > 10) {
            uniqueIds = uniqueIds.subList(0, 10);
        }

        return fundingListRepository.findByFundingIdIn(uniqueIds, userId);
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    protected void updateViewCount(Long fundingId, FundingType fundingType) {
        // DB 전체 조회수 증가
        statRepository.incrementViewCount(fundingId);

        // FUNDING 타입인 경우에만 -> Redis 버킷에 조회수 카운트 증가
        if (fundingType == FundingType.FUNDING) {
            try {
                redisRankingService.incrementViewBucket(fundingId);
                log.debug("Redis 버킷 조회수 증가: fundingId={}, fundingType={}", fundingId, fundingType);
            } catch (Exception e) {
                log.warn("Redis 버킷 조회수 업데이트 실패: fundingId={}, fundingType={}, error={}",
                        fundingId, fundingType, e.getMessage());
            }
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

    public List<AnimateTask> getAnimatedRequired() {
        return fundingRepository.findAnimateRequired();
    }

    @EventListener(AnimateDoneEvent.class)
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveAnimateResult(AnimateDoneEvent event) {
        Funding funding = fundingRepository.findById(event.getFundingId())
                .orElse(null);
        if (funding == null) {
            return;
        }
        String url = imageService.translatePath(ImageCategory.BANNER.getPrefix() + "-" + event.getAnimationUrl());
        funding.setTicketBanner(url);
    }

    @Transactional
    public VideoContentResult processVideoContent(VideoContentRequest request) {

        try {
            // 상영물 상세내용 요약 실행 (GMS API 호출)
            // String apiResponse = textSummaryApiClient.summarizeText(request);

            // 상영물 상세내용 요약 실행 (OpenAI API 호출)
            String apiResponse = openAiApiClient.summarizeText(request);
            return new VideoContentResult(apiResponse);

        } catch (Exception e) {
            log.error("상영물 상세내용 요약 작업 중 오류 발생 - 오류: {}", e.getMessage(), e);
            throw InternalServerException.ofSummarize();
        }
    }


}
