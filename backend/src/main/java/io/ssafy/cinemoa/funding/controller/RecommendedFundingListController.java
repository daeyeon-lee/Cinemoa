package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.service.RecommendedFundingListService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 추천 펀딩 목록 조회를 위한 Controller 클래스
 * <p>
 * 주요 기능: - 사용자별 추천 펀딩/투표 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 타입별 필터링 (funding, vote, all) - 성공 가능성 기반 추천 점수 계산
 * <p>
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class RecommendedFundingListController {

    private final RecommendedFundingListService recommendedFundingListService;

    /**
     * 특정 사용자에게 추천할 펀딩/투표 목록을 조회합니다.
     *
     * @param userId 조회할 사용자의 ID (Path Variable)
     * @return 추천 펀딩/투표 목록과 페이지네이션 정보
     */
    @GetMapping("/{userId}/recommended-funding")
    public ResponseEntity<ApiResponse<List<?>>> getRecommendedFundings(
            @PathVariable("userId") Long userId) {

        // Service를 통해 추천 펀딩/투표 목록 조회
        List<CardTypeFundingInfoDto> result = recommendedFundingListService.getRecommendedFundings(userId);

        // 성공 응답 반환
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }
}
