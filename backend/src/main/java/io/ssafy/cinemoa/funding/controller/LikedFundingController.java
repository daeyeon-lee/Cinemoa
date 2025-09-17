package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.service.LikedFundingService;
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
 * 보고싶어요 한 목록 조회를 위한 Controller 클래스
 * <p>
 * 주요 기능: - 특정 사용자가 보고싶어요한 펀딩/투표 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 타입별 필터링 (funding, vote, all)
 * <p>
 * API 경로: GET /api/user/{userId}/like
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class LikedFundingController {

    private final LikedFundingService likedFundingService;

    /**
     * 특정 사용자가 보고싶어요한 펀딩/투표 목록을 조회합니다. 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     *
     * @param userId 조회할 사용자의 ID (Path Variable)
     * @param cursor 다음 페이지 조회를 위한 커서 - 선택적 파라미터
     * @return 보고싶어요한 펀딩/투표 목록과 페이지네이션 정보
     */
    @GetMapping("/{userId}/like")
    public ResponseEntity<ApiResponse<?>> getLikedFundings(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "cursor", required = false) String cursor) {

        // Service를 통해 보고싶어요한 펀딩/투표 목록 조회
        CursorResponse<CardTypeFundingInfoDto> result = likedFundingService.getLikedFundings(userId, cursor);

        // 성공 응답 반환
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }
}
