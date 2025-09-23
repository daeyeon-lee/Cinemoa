package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.ParticipatedFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.CursorRequestDto;
import io.ssafy.cinemoa.funding.repository.ParticipatedFundingRepository;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.response.CursorResponse;
import io.ssafy.cinemoa.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 내가 참여한 목록 조회를 위한 Service 클래스
 * <p>
 * 주요 기능: - 특정 사용자가 참여한 펀딩 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 상태별 필터링 (ALL, ON_PROGRESS, SUCCESS, FAILED) - 관련 통계 정보 및
 * 좋아요 상태 조회
 * <p>
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@Service
@RequiredArgsConstructor
public class ParticipatedFundingService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final ParticipatedFundingRepository participatedFundingRepository; // 참여한 펀딩 데이터 조회

    /**
     * 특정 사용자가 참여한 펀딩 목록을 조회합니다. 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @param state  참여 상태 필터 (ALL, ON_PROGRESS, CLOSE)
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @param limit  한 번에 조회할 개수 (기본값: 20)
     * @return 참여한 펀딩 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public CursorResponse<ParticipatedFundingInfoDto> getParticipatedFundings(Long userId, String state, String cursor, Integer limit) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        // 2. 파라미터 검증 및 기본값 설정
        limit = validateAndSetDefaults(limit);

        CursorRequestDto request = new CursorRequestDto(cursor, limit);

        // 4. 펀딩 데이터 조회 (무한 스크롤)

        return participatedFundingRepository.findParticipatedFundings(userId, state, request);
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
