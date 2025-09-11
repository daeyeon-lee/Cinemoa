package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.funding.dto.*;
import io.ssafy.cinemoa.funding.repository.*;
import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 사용자가 제안한 상영물 목록 조회를 위한 Service 클래스
 * 
 * 주요 기능:
 * - 특정 사용자가 제안한 펀딩/투표 목록 조회
 * - 무한 스크롤 방식의 커서 기반 페이지네이션
 * - 펀딩/투표 타입별 필터링
 * - 관련 통계 정보 및 좋아요 상태 조회
 * 
 * API 경로: GET /api/user/{userId}/funding-proposals
 */
@Service
@RequiredArgsConstructor
public class UserSuggestedService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final FundingRepository fundingRepository; // 펀딩 데이터 조회
    private final UserFavoriteRepository userFavoriteRepository; // 사용자 좋아요 조회
    private final FundingCategoryRepository fundingCategoryRepository; // 펀딩 카테고리 조회
    private final ParticipationRepository participationRepository; // 참여자 수 조회 (Transaction 기반)

    /**
     * 특정 사용자가 제안한 펀딩/투표 목록을 조회합니다.
     * 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     * 
     * @param userId 조회할 사용자의 ID
     * @param type   펀딩 타입 필터 (funding, vote) - null이면 전체 조회
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @param limit  한 번에 조회할 개수 (기본값: 20)
     * @return 제안된 프로젝트 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public SuggestedProjectListResponse getSuggestedProjects(Long userId, String type, Long cursor, Integer limit) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        // 2. 파라미터 검증 및 기본값 설정
        limit = validateAndSetDefaults(type, cursor, limit);

        // 3. 펀딩 타입 변환 (문자열 -> enum)
        FundingType fundingType = convertToFundingType(type);

        // 4. 전체 개수 먼저 조회 (COUNT 쿼리)
        long totalCount = (fundingType == null)
                ? fundingRepository.countByLeader_Id(userId)
                : fundingRepository.countByLeader_IdAndFundingType(userId, fundingType);

        // 5. 펀딩 데이터 조회 (무한 스크롤)
        Page<Funding> fundingPage = getFundingPage(userId, fundingType, cursor, limit);

        // 6. 펀딩 ID 목록 추출
        List<Long> fundingIds = fundingPage.getContent().stream()
                .map(Funding::getFundingId)
                .collect(Collectors.toList());

        if (fundingIds.isEmpty()) {
            // 조회된 데이터가 없는 경우 빈 응답 반환
            return SuggestedProjectListResponse.builder()
                    .items(List.of())
                    .pagination(PaginationDto.builder()
                            .nextCursor(null)
                            .hasNext(false)
                            .totalCount(totalCount)
                            .build())
                    .build();
        }

        // 7. 관련 데이터 조회 (통계, 좋아요, 카테고리)
        Map<Long, FundingStatDto> fundingStats = getFundingStats(fundingIds);
        Set<Long> likedFundingIds = getLikedFundingIds(userId, fundingIds);
        Map<Long, Long> fundingCategories = getFundingCategories(fundingIds);

        // 8. DTO 변환
        List<SuggestedProjectItemDto> items = fundingPage.getContent().stream()
                .map(funding -> convertToSuggestedProjectItemDto(
                        funding, fundingStats.get(funding.getFundingId()),
                        likedFundingIds.contains(funding.getFundingId()),
                        fundingCategories.get(funding.getFundingId())))
                .collect(Collectors.toList());

        // 9. 페이지네이션 정보 생성
        PaginationDto pagination = createPaginationDto(fundingPage, limit, totalCount);

        // 10. 다음 페이지가 있다면, 응답할 items 리스트에서 추가 데이터를 잘라냄
        if (pagination.getHasNext()) {
            items = items.subList(0, limit);
        }

        return SuggestedProjectListResponse.builder()
                .items(items) // 잘라낸 리스트 반환
                .pagination(pagination)
                .build();
    }

    /**
     * 파라미터 검증 및 기본값 설정
     * 
     * @param type   펀딩 타입 (funding, vote)
     * @param cursor 커서 값
     * @param limit  조회 개수
     * @return 검증된 limit 값
     */
    private Integer validateAndSetDefaults(String type, Long cursor, Integer limit) {
        // type 검증
        if (type != null && !type.equals("funding") && !type.equals("vote")) {
            throw new BadRequestException("type은 funding 또는 vote만 가능합니다.", ResourceCode.INPUT);
        }

        // cursor 유효성 검증 : 0보다 커야 함
        if (cursor != null && cursor <= 0) {
            throw new BadRequestException("커서 값이 올바르지 않습니다.", ResourceCode.INPUT);
        }

        // limit 기본값 설정 : 0보다 안 크면 20으로 설정
        if (limit == null || limit <= 0) {
            limit = 20; // 기본값
        }

        return limit;
    }

    /**
     * 문자열을 FundingType enum으로 변환
     * 
     * @param type 문자열 타입 (funding, vote)
     * @return FundingType enum (null이면 전체 조회)
     */
    private FundingType convertToFundingType(String type) {
        if (type == null) {
            return null; // 전체 조회
        }
        return "funding".equals(type) ? FundingType.INSTANT : FundingType.VOTE;
    }

    /**
     * 펀딩 데이터를 페이지 단위로 조회
     * 무한 스크롤을 위해 커서 기반 페이지네이션 사용
     * 
     * @param userId      사용자 ID
     * @param fundingType 펀딩 타입 (null이면 전체)
     * @param cursor      커서 값 (null이면 첫 페이지)
     * @param limit       조회 개수
     * @return 펀딩 페이지 데이터
     */
    private Page<Funding> getFundingPage(Long userId, FundingType fundingType, Long cursor, Integer limit) {
        // hasNext 판단을 위해 limit+1개 조회
        Pageable pageable = PageRequest.of(0, limit + 1);

        if (cursor == null) {
            // 첫 페이지 조회
            if (fundingType == null) {
                // 전체 목록 조회
                return fundingRepository.findByLeader_IdOrderByFundingIdDesc(userId, pageable);
            } else {
                // 타입별 필터링 조회
                return fundingRepository.findByLeader_IdAndFundingTypeOrderByFundingIdDesc(userId, fundingType,
                        pageable);
            }
        } else {
            // 다음 페이지 조회 (커서 기반)
            if (fundingType == null) {
                // 전체 목록의 다음 페이지, 최신순이기에 더 작은 ID를 조회
                return fundingRepository.findByLeader_IdAndFundingIdLessThanOrderByFundingIdDesc(userId, cursor,
                        pageable);
            } else {
                // 타입별 필터링된 다음 페이지
                return fundingRepository.findByLeader_IdAndFundingIdLessThanAndFundingTypeOrderByFundingIdDesc(userId,
                        cursor, fundingType, pageable);
            }
        }
    }

    /**
     * 펀딩 통계 정보를 Map으로 조회
     * N+1 문제 방지를 위한 일괄 조회
     * 
     * @param fundingIds 펀딩 ID 목록
     * @return 펀딩 ID를 키로 하는 통계 정보 Map
     */
    private Map<Long, FundingStatDto> getFundingStats(List<Long> fundingIds) {
        // FundingStat에서 기본 통계 정보 조회
        Map<Long, FundingStatDto> fundingStats = fundingRepository.findFundingStatsByFundingIds(fundingIds)
                .stream()
                .collect(Collectors.toMap(
                        FundingStatDto::getFundingId,
                        stat -> stat));
        
        // Transaction에서 참여자 수 조회하여 업데이트
        List<Object[]> transactionCounts = participationRepository.countSuccessfulTransactionsByFundingIds(fundingIds);
        for (Object[] result : transactionCounts) {
            Long fundingId = (Long) result[0];
            Long participantCount = (Long) result[1];
            
            if (fundingStats.containsKey(fundingId)) {
                // 기존 통계 정보에 참여자 수 업데이트
                FundingStatDto existingStat = fundingStats.get(fundingId);
                fundingStats.put(fundingId, FundingStatDto.builder()
                        .fundingId(existingStat.getFundingId())
                        .participantCount(participantCount.intValue())
                        .viewCount(existingStat.getViewCount())
                        .favoriteCount(existingStat.getFavoriteCount())
                        .build());
            } else {
                // 새로운 통계 정보 생성 (참여자 수만 있는 경우)
                fundingStats.put(fundingId, FundingStatDto.builder()
                        .fundingId(fundingId)
                        .participantCount(participantCount.intValue())
                        .viewCount(0)
                        .favoriteCount(0)
                        .build());
            }
        }
        
        return fundingStats;
    }

    /**
     * 사용자가 좋아요를 누른 펀딩 ID 목록 조회
     * 
     * @param userId     사용자 ID
     * @param fundingIds 펀딩 ID 목록
     * @return 좋아요를 누른 펀딩 ID Set
     */
    private Set<Long> getLikedFundingIds(Long userId, List<Long> fundingIds) {
        return userFavoriteRepository.findLikedFundingIdsByUserIdAndFundingIds(userId, fundingIds); // 데이터베이스 일괄 조회
    }

    /**
     * 펀딩별 카테고리 ID 조회
     * 
     * @param fundingIds 펀딩 ID 목록
     * @return 펀딩 ID를 키로 하는 카테고리 ID Map
     */
    private Map<Long, Long> getFundingCategories(List<Long> fundingIds) {
        return fundingCategoryRepository.findByFundingIds(fundingIds)
                .stream()
                .collect(Collectors.toMap(
                        fc -> fc.getFunding().getFundingId(),
                        fc -> fc.getCategory().getCategoryId()));
    }

    /**
     * Funding 엔티티를 SuggestedProjectItemDto로 변환
     * 
     * @param funding     펀딩 엔티티
     * @param fundingStat 펀딩 통계 정보
     * @param isLiked     좋아요 여부
     * @param categoryId  카테고리 ID
     * @return 변환된 DTO
     */
    private SuggestedProjectItemDto convertToSuggestedProjectItemDto(
            Funding funding, FundingStatDto fundingStat, boolean isLiked, Long categoryId) {

        // 펀딩/투표 타입 결정
        String type = funding.getFundingType() == FundingType.INSTANT ? "funding" : "vote";

        // 기본 정보 DTO 생성
        FundingInfoDto fundingInfo = createFundingInfoDto(funding, fundingStat);

        // 제안자 정보 DTO 생성
        ProposerDto proposer = createProposerDto(funding);

        // 상영 정보 DTO 생성
        ScreeningDto screening = createScreeningDto(funding);

        // 참여 및 통계 정보 DTO 생성
        ParticipationDto participation = createParticipationDto(funding, fundingStat, isLiked);

        // 메타데이터 DTO 생성
        MetadataDto metadata = createMetadataDto(funding, fundingStat, categoryId);

        return SuggestedProjectItemDto.builder()
                .type(type)
                .funding(type.equals("funding") ? fundingInfo : null)
                .vote(type.equals("vote") ? fundingInfo : null)
                .proposer(proposer)
                .screening(screening)
                .participation(participation)
                .metadata(metadata)
                .build();
    }

    /**
     * 펀딩 기본 정보 DTO 생성
     * 
     * @param funding     펀딩 엔티티
     * @param fundingStat 펀딩 통계 정보
     * @return 펀딩 기본 정보 DTO
     */
    private FundingInfoDto createFundingInfoDto(Funding funding, FundingStatDto fundingStat) {
        // 진행률 계산 (펀딩인 경우에만)
        Integer progressRate = null;
        if (funding.getFundingType() == FundingType.INSTANT && funding.getMaxPeople() > 0) {
            int participantCount = fundingStat != null ? fundingStat.getParticipantCount() : 0;
            progressRate = Math.min(100, (participantCount * 100) / funding.getMaxPeople());
        }

        // 1인당 가격 계산 (펀딩인 경우에만)
        Integer price = null;
        if (funding.getFundingType() == FundingType.INSTANT) {
            // TODO: screens 테이블에서 price 정보를 가져와야 함
            // 현재는 임시로 0으로 설정
            price = 0;
        }

        return FundingInfoDto.builder()
                .fundingId(funding.getFundingId())
                .title(funding.getTitle())
                .bannerUrl(funding.getBannerUrl())
                .state(funding.getState().name())
                .progressRate(progressRate)
                .fundingStartsOn(funding.getCreatedAt().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "+09:00")
                .fundingEndsOn(funding.getEndsOn() != null
                        ? funding.getEndsOn().format(DateTimeFormatter.ISO_LOCAL_DATE) + "T23:59:59+09:00"
                        : null)
                .price(price)
                .build();
    }

    /**
     * 제안자 정보 DTO 생성
     * 
     * @param funding 펀딩 엔티티
     * @return 제안자 정보 DTO
     */
    private ProposerDto createProposerDto(Funding funding) {
        return ProposerDto.builder()
                .proposerId(funding.getLeader().getId())
                .creatorNickname(funding.getLeader().getNickname())
                .build();
    }

    /**
     * 상영 정보 DTO 생성
     * 
     * @param funding 펀딩 엔티티
     * @return 상영 정보 DTO
     */
    private ScreeningDto createScreeningDto(Funding funding) {
        return ScreeningDto.builder()
                .videoName(funding.getVideoName())
                // .screeningTitle(funding.getFundingType() == FundingType.VOTE ?
                // funding.getTitle() : null)
                .screenStartsOn(funding.getScreenStartsOn() != null ? funding.getScreenStartsOn().intValue() : null)
                .screenEndsOn(funding.getScreenEndsOn() != null ? funding.getScreenEndsOn().intValue() : null)
                .build();
    }

    /**
     * 참여 및 통계 정보 DTO 생성
     * 
     * @param funding     펀딩 엔티티
     * @param fundingStat 펀딩 통계 정보
     * @param isLiked     좋아요 여부
     * @return 참여 및 통계 정보 DTO
     */
    private ParticipationDto createParticipationDto(Funding funding, FundingStatDto fundingStat, boolean isLiked) {
        return ParticipationDto.builder()
                .participantCount(fundingStat != null ? fundingStat.getParticipantCount() : 0)
                .maxPeople(funding.getMaxPeople())
                .viewCount(fundingStat != null ? fundingStat.getViewCount() : 0)
                .likeCount(fundingStat != null ? fundingStat.getFavoriteCount() : 0)
                .isLike(isLiked)
                .build();
    }

    /**
     * 메타데이터 DTO 생성
     * 
     * @param funding     펀딩 엔티티
     * @param fundingStat 펀딩 통계 정보
     * @param categoryId  카테고리 ID
     * @return 메타데이터 DTO
     */
    private MetadataDto createMetadataDto(Funding funding, FundingStatDto fundingStat, Long categoryId) {
        // 추천 점수 계산: 조회수(2점) + 진행률(1점)
        int recommendationScore = 0;
        if (fundingStat != null) {
            recommendationScore += fundingStat.getViewCount() * 2;
        }

        if (funding.getFundingType() == FundingType.INSTANT && funding.getMaxPeople() > 0) {
            int participantCount = fundingStat != null ? fundingStat.getParticipantCount() : 0;
            int progressRate = (participantCount * 100) / funding.getMaxPeople();
            recommendationScore += progressRate;
        }

        return MetadataDto.builder()
                .categoryId(categoryId)
                .recommendationScore(recommendationScore)
                .build();
    }

    /**
     * 페이지네이션 정보 DTO 생성
     * 
     * @param fundingPage 펀딩 페이지 데이터
     * @param fundingIds  펀딩 ID 목록
     * @param limit       실제 요청된 limit 값
     * @return 페이지네이션 정보 DTO
     */
    private PaginationDto createPaginationDto(Page<Funding> fundingPage, Integer limit, Long totalCount) {
        // hasNext 판단: 실제 조회된 데이터가 limit보다 많으면 다음 페이지 존재
        // limit+1개를 조회했으므로, 실제 데이터가 limit보다 많으면 다음 페이지가 있음
        boolean hasNext = fundingPage.getContent().size() > limit;
        Long nextCursor = null;

        if (hasNext) {
            // 마지막 항목의 ID를 다음 커서로 설정
            nextCursor = fundingPage.getContent().get(limit - 1).getFundingId();
        }

        return PaginationDto.builder()
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .totalCount(totalCount)
                .build();
    }
}
