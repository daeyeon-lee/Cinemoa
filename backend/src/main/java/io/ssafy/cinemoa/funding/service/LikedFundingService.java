package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.CursorRequestDto;
import io.ssafy.cinemoa.funding.enums.FundingType;
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
     * @param type   펀딩/투표 타입 필터링 (funding, vote)
     * @param cursor 다음 페이지 조회를 위한 커서 (이전 응답의 nextCursor 값)
     * @param limit  한 번에 조회할 개수 (기본값: 20)
     * @return 보고싶어요한 펀딩/투표 목록과 페이지네이션 정보
     */
    @Transactional(readOnly = true)
    public CursorResponse<CardTypeFundingInfoDto> getLikedFundings(Long userId, String type, String cursor, Integer limit) {
        // 1. 사용자 존재 여부 확인
        if (!userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        // 2. type 파라미터 검증 및 변환
        FundingType fundingType = validateAndConvertType(type);

        // 3. 파라미터 검증 및 기본값 설정
        if (!validateCursor(cursor)) {
            throw new BadRequestException("커서 값이 잘못되었습니다.", ResourceCode.INPUT);
        }

        limit = validateAndSetDefaults(limit);

        // 4. 요청 DTO 생성 (hasNext 판단을 위해 limit + 1개 조회)
        CursorRequestDto request = new CursorRequestDto(cursor, limit);

        return likedFundingRepository.findLikedFundings(userId, fundingType, request);
    }

    /**
     * type 파라미터 검증 및 변환
     *
     * @param type 펀딩/투표 타입 문자열
     * @return FundingType enum (null이면 null 반환)
     */
    private FundingType validateAndConvertType(String type) {
        if (type == null || type.trim().isEmpty()) {
            return null; // type이 없으면 모든 타입 조회
        }

        try {
            return FundingType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 타입입니다. 'funding' 또는 'vote'를 입력해주세요.");
        }
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
            // Base64 디코딩
            String decoded = new String(java.util.Base64.getDecoder().decode(cursor));
            String[] parts = decoded.split("_");
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
