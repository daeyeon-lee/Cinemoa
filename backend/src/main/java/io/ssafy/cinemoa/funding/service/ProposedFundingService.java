package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.CursorRequestDto;
import io.ssafy.cinemoa.funding.repository.ProposedFundingRepository;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.response.CursorResponse;
import io.ssafy.cinemoa.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 사용자가 제안한 상영물 목록 조회를 위한 Service 클래스
 * <p>
 * 주요 기능: - 특정 사용자가 제안한 펀딩/투표 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 펀딩/투표 타입별 필터링 - 관련 통계 정보 및 좋아요 상태 조회
 * <p>
 * API 경로: GET /api/user/{userId}/funding-proposals
 */
@Service
@RequiredArgsConstructor
public class ProposedFundingService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final ProposedFundingRepository proposedFundingRepository; // 제안한 펀딩 데이터 조회

    /**
     * 특정 사용자가 제안한 펀딩 목록을 조회합니다. 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @param limit  한 번에 조회할 개수 (기본값: 20)
     * @return 제안한 펀딩 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public CursorResponse<CardTypeFundingInfoDto> getProposedFunding(Long userId, String cursor, Integer limit) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        limit = validateAndSetDefaults(limit);
        CursorRequestDto request = new CursorRequestDto(cursor, limit);
        return proposedFundingRepository.findProposedFundings(userId, request);
    }


    /**
     * 파라미터 검증 및 기본값 설정
     *
     * @param limit 조회 개수
     * @return 검증된 limit 값
     */
    private Integer validateAndSetDefaults(Integer limit) {
        // limit 기본값 설정 : 0보다 안 크면 20으로 설정
        if (limit == null || limit <= 0) {
            limit = 20; // 기본값
        }

        return limit;
    }
}
