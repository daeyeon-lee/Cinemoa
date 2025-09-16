package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.service.ParticipatedFundingService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.global.response.CursorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 내가 참여한 목록 조회를 위한 Controller 클래스
 * <p>
 * 주요 기능: - 특정 사용자가 참여한 펀딩 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 상태별 필터링 (ALL, ON_PROGRESS, SUCCESS, FAILED)
 * <p>
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class ParticipatedFundingController {

    private final ParticipatedFundingService participatedFundingService;

    /**
     * 특정 사용자가 참여한 펀딩 목록을 조회합니다. 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID (Path Variable)
     * @param cursor 다음 페이지 조회를 위한 커서 - 선택적 파라미터
     * @param limit  한 번에 조회할 개수 - 선택적 파라미터 (기본값: 20)
     * @return 참여한 펀딩 목록과 페이지네이션 정보
     */
    @GetMapping("/{userId}/participated-funding")
    public ResponseEntity<ApiResponse<CursorResponse<?>>> getParticipatedFundings(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "cursor", required = false) String cursor,
            @RequestParam(value = "limit", required = false) Integer limit) {

        // Service를 통해 참여한 펀딩 목록 조회
        CursorResponse<CardTypeFundingInfoDto> result = participatedFundingService.getParticipatedFundings(userId,
                cursor, limit);

        // 성공 응답 반환
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }
}
