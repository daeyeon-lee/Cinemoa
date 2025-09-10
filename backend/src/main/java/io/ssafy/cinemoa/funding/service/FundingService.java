package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.cinema.repository.CinemaRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.CinemaInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.FundingInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.FundingStatInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.ProposerInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.ScreenInfo;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse.VideoInfo;
import io.ssafy.cinemoa.funding.dto.VoteCreateRequest;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.funding.exception.SeatLockException;
import io.ssafy.cinemoa.funding.repository.FundingEstimatedDayRepository;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingEstimatedDay;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
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
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FundingService {


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
    private final FundingEstimatedDayRepository fundingEstimatedDayRepository;
    private final FundingRepository fundingRepository;
    private final FundingStatRepository statRepository;

    private final ScreenRepository screenRepository;
    private final CinemaRepository cinemaRepository;

    private final UserRepository userRepository;
    private final UserFavoriteRepository userFavoriteRepository;
    private final RedisService redisService;

    public void createFunding(FundingCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(ResourceNotFoundException::ofUser);

        Funding funding = Funding.builder()
                .fundingType(FundingType.INSTANT)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .videoName(request.getVideoName())
                .leader(user)
                .maxPeople(request.getMaxPeople())
                .screenDay(request.getScreenDay())
                .screenStartsOn(request.getScreenStartsOn())
                .screenEndsOn(request.getScreenEndsOn())
                .state(FundingState.EVALUATING)
                .endsOn(request.getScreenDay().minusDays(7))
                .build();

        fundingRepository.save(funding);
    }

    @Transactional
    public void holdSeatOf(Long userId, Long fundingId) {
        //put seat info on redis, then reduce remaining seats.
        if (!fundingRepository.existsById(fundingId)) {
            throw ResourceNotFoundException.ofFunding();
        }

        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        FundingStat fundingStat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(() -> {
                    log.error("존재하는 펀딩이나 통계가 존재하지 않습니다. 펀딩 id : {}", fundingId);
                    return InternalServerException.ofUnknown();
                });

        List<Object> result = redisService.execute(
                RedisScript.of(SEAT_RESERVATION_SCRIPT, List.class),
                Arrays.asList(fundingId.toString(), userId.toString()),
                funding.getMaxPeople().toString(),
                "180"
        );

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
                Arrays.asList(fundingId.toString(), userId.toString())
        );

        Integer success = (Integer) result.get(0);
        if (success == 0) {
            throw SeatLockException.ofNotHolding();
        }
    }

    @Transactional
    public void createVote(VoteCreateRequest request) {

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(ResourceNotFoundException::ofUser);

        Funding vote = Funding.builder()
                .fundingType(FundingType.VOTE)
                .bannerUrl(request.getPosterUrl())
                .content(request.getContent())
                .title(request.getTitle())
                .videoName(request.getVideoName())
                .leader(user)
                .maxPeople(request.getMaxPeople())
                .state(FundingState.EVALUATING)
                .endsOn(LocalDate.from(ZonedDateTime.now(ZoneId.of("Asia/Seoul")).plusDays(14)))
                .build();

        FundingEstimatedDay estimatedDay = new FundingEstimatedDay(vote, request.getRangeStart(),
                request.getRangeEnd());

        fundingRepository.save(vote);

        fundingEstimatedDayRepository.save(estimatedDay);
    }

    @Transactional
    public FundingDetailResponse getFundingDetail(Long fundingId, Long userId) {
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        FundingStat stat = statRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(InternalServerException::ofUnknown);

        Boolean isLiked =
                userId != null && userFavoriteRepository.existsByUser_IdAndFunding_FundingId(userId, fundingId);

        Screen screen = funding.getScreen();
        Cinema cinema = funding.getCinema();
        User proposer = funding.getLeader();

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
                .cinema(cinemaInfo)
                .build();

        stat.setViewCount(stat.getViewCount() + 1);

        return response;
    }
}
