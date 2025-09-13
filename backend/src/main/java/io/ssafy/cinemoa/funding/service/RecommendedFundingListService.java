package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.PageInfoDto;
import io.ssafy.cinemoa.funding.dto.PaginationDto;
import io.ssafy.cinemoa.funding.dto.RecommendedFundingItemDto;
import io.ssafy.cinemoa.funding.dto.RecommendedFundingListResponseDto;
import io.ssafy.cinemoa.funding.dto.RecommendedFundingRequestDto;
import io.ssafy.cinemoa.funding.repository.RecommendedFundingListRepository;
import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 추천 펀딩 목록 조회를 위한 Service 클래스
 *
 * 주요 기능:
 * - 사용자별 추천 펀딩/투표 목록 조회
 * - 무한 스크롤 방식의 커서 기반 페이지네이션
 * - 타입별 필터링 (funding, vote, all)
 * - 성공 가능성 기반 추천 점수 계산
 *
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Service
@RequiredArgsConstructor
public class RecommendedFundingListService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final RecommendedFundingListRepository recommendedFundingListRepository; // 추천 펀딩 데이터 조회

    /**
     * 특정 사용자에게 추천할 펀딩/투표 목록을 조회합니다.
     * 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @param typeStr 펀딩/투표 타입 필터 (null이면 전체 조회)
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @param limit 한 번에 조회할 개수 (기본값: 20)
     * @return 추천 펀딩/투표 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public RecommendedFundingListResponseDto getRecommendedFundings(Long userId, String typeStr, Long cursor, Integer limit) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        // 2. 파라미터 검증 및 기본값 설정
        limit = validateAndSetDefaults(typeStr, cursor, limit);

        // 3. 요청 DTO 생성 (hasNext 판단을 위해 limit + 1개 조회)
        RecommendedFundingRequestDto request = new RecommendedFundingRequestDto(typeStr, cursor, limit + 1);

        // 4. 추천 펀딩 데이터 조회 (무한 스크롤)
        Page<RecommendedFundingItemDto> fundingPage = recommendedFundingListRepository.findRecommendedFundings(userId, request, typeStr);

        // 5. 펀딩 목록 추출
        List<RecommendedFundingItemDto> content = fundingPage.getContent();

        // 6. 페이지네이션 정보 생성
        PaginationDto pagination = createPaginationDto(content, limit, fundingPage.getTotalElements());

        // 7. 다음 페이지가 있다면, 응답할 content 리스트에서 추가 데이터를 잘라냄
        if (pagination.getHasNext()) {
            content = content.subList(0, limit);
        }

        // 8. 빈 데이터인 경우 처리
        if (content.isEmpty()) {
            return RecommendedFundingListResponseDto.builder()
                    .content(List.of())
                    .page(createPageInfo(fundingPage))
                    .pagination(PaginationDto.builder()
                            .nextCursor(null)
                            .hasNext(false)
                            .totalCount(fundingPage.getTotalElements())
                            .build())
                    .build();
        }

        return RecommendedFundingListResponseDto.builder()
                .content(content) // 잘라낸 리스트 반환
                .page(createPageInfo(fundingPage))
                .pagination(pagination)
                .build();
    }

    /**
     * 파라미터 검증 및 기본값 설정
     *
     * @param typeStr 펀딩/투표 타입 필터
     * @param cursor 커서 값
     * @param limit 조회 개수
     * @return 검증된 limit 값
     */
    private Integer validateAndSetDefaults(String typeStr, Long cursor, Integer limit) {
        // cursor 유효성 검증 : 0보다 커야 함
        if (cursor != null && cursor <= 0) {
            throw new BadRequestException("커서 값이 올바르지 않습니다.", ResourceCode.INPUT);
        }

        // typeStr 유효성 검증
        if (typeStr != null && !isValidType(typeStr)) {
            throw new BadRequestException("지원하지 않는 type 값입니다: " + typeStr, ResourceCode.INPUT);
        }

        // limit 기본값 설정 : 0보다 안 크면 20으로 설정
        if (limit == null || limit <= 0) {
            limit = 20; // 기본값
        }

        return limit;
    }

    /**
     * 타입 문자열 유효성 검증
     *
     * @param typeStr 검증할 타입 문자열
     * @return 유효한 타입인지 여부
     */
    private boolean isValidType(String typeStr) {
        return "funding".equalsIgnoreCase(typeStr) || 
               "vote".equalsIgnoreCase(typeStr) || 
               "all".equalsIgnoreCase(typeStr);
    }

    /**
     * 페이지 정보 DTO 생성
     *
     * @param page 펀딩 페이지 데이터
     * @return 페이지 정보 DTO
     */
    private PageInfoDto createPageInfo(Page<RecommendedFundingItemDto> page) {
        return PageInfoDto.builder()
                .size(page.getSize())
                .number(page.getNumber())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .build();
    }

    /**
     * 페이지네이션 정보 DTO 생성
     *
     * @param content 펀딩 목록 데이터
     * @param limit 조회 개수
     * @param totalCount 전체 데이터 개수
     * @return 페이지네이션 정보 DTO
     */
    private PaginationDto createPaginationDto(List<RecommendedFundingItemDto> content, Integer limit, Long totalCount) {
        // hasNext 판단: limit+1개 조회했는데 limit+1개가 나왔으면 다음 페이지가 있음
        boolean hasNext = content.size() > limit;
        
        // nextCursor: hasNext가 true일 때 마지막 항목의 fundingId
        Long nextCursor = null;
        if (hasNext && !content.isEmpty()) {
            // limit번째 항목(인덱스 limit-1)의 fundingId를 nextCursor로 사용
            nextCursor = content.get(limit - 1).getFunding().getFundingId();
        }

        return PaginationDto.builder()
                .nextCursor(nextCursor)
                .hasNext(hasNext)
                .totalCount(totalCount)
                .build();
    }
}
