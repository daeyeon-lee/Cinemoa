package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.CursorRequestDto;
import io.ssafy.cinemoa.funding.repository.LikedFundingRepository;
import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.response.CursorResponse;
import io.ssafy.cinemoa.user.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 보고싶어요 한 목록 조회를 위한 Service 클래스
 * <p>
 * 주요 기능: - 특정 사용자가 보고싶어요한 펀딩/투표 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 타입별 필터링 (funding, vote, all) - 관련 통계 정보 및 좋아요 상태 조회
 * <p>
 * API 경로: GET /api/user/{userId}/like
 */
@Service
@RequiredArgsConstructor
public class LikedFundingService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final LikedFundingRepository likedFundingRepository; // 보고싶어요한 펀딩 데이터 조회

    /**
     * 특정 사용자가 보고싶어요한 펀딩/투표 목록을 조회합니다. 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @return 보고싶어요한 펀딩/투표 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public CursorResponse<CardTypeFundingInfoDto> getLikedFundings(Long userId, String cursor) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        // 2. 파라미터 검증 및 기본값 설정
        if (!validateCursor(cursor)) {
            throw new BadRequestException("커서 값이 잘못되었습니다.", ResourceCode.INPUT);
        }

        int limit = 10;

        // 3. 요청 DTO 생성 (hasNext 판단을 위해 limit + 1개 조회)
        CursorRequestDto request = new CursorRequestDto(cursor, limit);

        return likedFundingRepository.findLikedFundings(userId, request);
    }

    /**
     * 파라미터 검증 및 기본값 설정
     *
     * @param cursor 커서 값
     */
    private boolean validateCursor(String cursor) {
        if (cursor == null) {
            return true;
        }

        try {
            String[] parts = cursor.split("_");
            if (parts.length != 2) {
                return false;
            }

            LocalDateTime.parse(parts[0]);  // 시간 파싱 검증
            Long.parseLong(parts[1]);       // ID 파싱 검증
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
