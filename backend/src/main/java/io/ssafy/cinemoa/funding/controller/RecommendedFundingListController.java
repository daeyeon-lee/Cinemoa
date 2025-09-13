package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.RecommendedFundingListResponseDto;
import io.ssafy.cinemoa.funding.service.RecommendedFundingListService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 추천 펀딩 목록 조회를 위한 Controller 클래스
 * 
 * 주요 기능:
 * - 사용자별 추천 펀딩/투표 목록 조회
 * - 무한 스크롤 방식의 커서 기반 페이지네이션
 * - 타입별 필터링 (funding, vote, all)
 * - 성공 가능성 기반 추천 점수 계산
 * 
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class RecommendedFundingListController {

    private final RecommendedFundingListService recommendedFundingListService;

    /**
     * 특정 사용자에게 추천할 펀딩/투표 목록을 조회합니다.
     * 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     * 
     * @param userId 조회할 사용자의 ID (Path Variable)
     * @param type 펀딩/투표 타입 필터 (funding, vote, all) - 선택적 파라미터
     * @param cursor 다음 페이지 조회를 위한 커서 - 선택적 파라미터
     * @param limit 한 번에 조회할 개수 - 선택적 파라미터 (기본값: 20)
     * @return 추천 펀딩/투표 목록과 페이지네이션 정보
     */
    @GetMapping("/{userId}/recommended-funding")
    public ResponseEntity<ApiResponse<RecommendedFundingListResponseDto>> getRecommendedFundings(
            @PathVariable("userId") Long userId,
            @RequestParam(value = "type", required = false) String type,
            @RequestParam(value = "cursor", required = false) Long cursor,
            @RequestParam(value = "limit", required = false) Integer limit) {
        
        // Service를 통해 추천 펀딩/투표 목록 조회
        RecommendedFundingListResponseDto result = recommendedFundingListService.getRecommendedFundings(userId, type, cursor, limit);
        
        // 성공 응답 반환
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }
}
