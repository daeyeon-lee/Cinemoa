package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.ParticipatedFundingItemDto;
import io.ssafy.cinemoa.funding.dto.ParticipatedFundingListResponse;
import io.ssafy.cinemoa.funding.dto.ParticipatedFundingRequest;
import io.ssafy.cinemoa.funding.dto.PaginationDto;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.repository.ParticipatedFundingRepository;
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
 * 내가 참여한 목록 조회를 위한 Service 클래스
 *
 * 주요 기능:
 * - 특정 사용자가 참여한 펀딩 목록 조회
 * - 무한 스크롤 방식의 커서 기반 페이지네이션
 * - 상태별 필터링 (ALL, ON_PROGRESS, SUCCESS, FAILED)
 * - 관련 통계 정보 및 좋아요 상태 조회
 *
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@Service
@RequiredArgsConstructor
public class ParticipatedFundingService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final ParticipatedFundingRepository participatedFundingRepository; // 참여한 펀딩 데이터 조회

    /**
     * 특정 사용자가 참여한 펀딩 목록을 조회합니다.
     * 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @param state  참여 상태 필터 (null이면 전체 조회)
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @param limit  한 번에 조회할 개수 (기본값: 20)
     * @return 참여한 펀딩 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public ParticipatedFundingListResponse getParticipatedFundings(Long userId, String stateStr, Long cursor, Integer limit) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        // 2. 파라미터 검증 및 기본값 설정
        limit = validateAndSetDefaults(null, cursor, limit);

        // 3. 요청 DTO 생성 (hasNext 판단을 위해 limit + 1개 조회)
        ParticipatedFundingRequest request = new ParticipatedFundingRequest(null, cursor, limit + 1);

        // 4. 펀딩 데이터 조회 (무한 스크롤)
        Page<ParticipatedFundingItemDto> fundingPage = participatedFundingRepository.findParticipatedFundings(userId, request, stateStr);

        // 5. 펀딩 목록 추출
        List<ParticipatedFundingItemDto> content = fundingPage.getContent();

        // 6. 페이지네이션 정보 생성
        PaginationDto pagination = createPaginationDto(content, limit, fundingPage.getTotalElements());

        // 7. 다음 페이지가 있다면, 응답할 content 리스트에서 추가 데이터를 잘라냄
        if (pagination.getHasNext()) {
            content = content.subList(0, limit);
        }

        // 8. 빈 데이터인 경우 처리
        if (content.isEmpty()) {
            return ParticipatedFundingListResponse.builder()
                    .content(List.of())
                    .page(createPageInfo(fundingPage))
                    .pagination(PaginationDto.builder()
                            .nextCursor(null)
                            .hasNext(false)
                            .totalCount(fundingPage.getTotalElements())
                            .build())
                    .build();
        }

        return ParticipatedFundingListResponse.builder()
                .content(content) // 잘라낸 리스트 반환
                .page(createPageInfo(fundingPage))
                .pagination(pagination)
                .build();
    }


    

    /**
     * 파라미터 검증 및 기본값 설정
     *
     * @param state  참여 상태 필터
     * @param cursor 커서 값
     * @param limit  조회 개수
     * @return 검증된 limit 값
     */
    private Integer validateAndSetDefaults(FundingState state, Long cursor, Integer limit) {
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
     * 페이지 정보 DTO 생성
     *
     * @param page 펀딩 페이지 데이터
     * @return 페이지 정보 DTO
     */
    private ParticipatedFundingListResponse.PageInfo createPageInfo(Page<ParticipatedFundingItemDto> page) {
        return ParticipatedFundingListResponse.PageInfo.builder()
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
     * @param limit   조회 개수
     * @param totalCount 전체 데이터 개수
     * @return 페이지네이션 정보 DTO
     */
    private PaginationDto createPaginationDto(List<ParticipatedFundingItemDto> content, Integer limit, Long totalCount) {
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
