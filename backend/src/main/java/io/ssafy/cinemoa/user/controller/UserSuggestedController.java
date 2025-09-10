package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.SuggestedProjectListResponse;
import io.ssafy.cinemoa.user.service.UserSuggestedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * 사용자가 제안한 상영물 목록 조회를 위한 Controller 클래스
 * 
 * 주요 기능:
 * - 특정 사용자가 제안한 펀딩/투표 목록 조회
 * - 무한 스크롤 방식의 커서 기반 페이지네이션
 * - 펀딩/투표 타입별 필터링
 * 
 * API 경로: GET /api/user/{userId}/funding-proposals
 */
@RestController // Rest API -> JSON이나 XML 형식으로 데이터를 반환
@RequiredArgsConstructor // final 생성자 주입 -> 의존성 주입
@RequestMapping("/api/user")
public class UserSuggestedController {

    private final UserSuggestedService userSuggestedService; // UserSuggestedService 의존성 주입

    /**
     * 특정 사용자가 제안한 펀딩/투표 목록을 조회합니다.
     * 무한 스크롤 방식으로 동작하며, 커서 기반 페이지네이션을 사용합니다.
     * 
     * @param userId 조회할 사용자의 ID (Path Variable)
     * @param type 펀딩 타입 필터 (funding, vote) - 선택적 파라미터
     * @param cursor 다음 페이지 조회를 위한 커서 - 선택적 파라미터
     * @param limit 한 번에 조회할 개수 - 선택적 파라미터 (기본값: 20)
     * @return 제안된 프로젝트 목록과 페이지네이션 정보
     */
    @GetMapping("/{userId}/funding-proposals")
    public ResponseEntity<ApiResponse<SuggestedProjectListResponse>> getSuggestedProjects(
            @PathVariable("userId") Long userId,// 파라미터
            @RequestParam(value = "type", required = false) String type,// ?type=funding, null이면 전체 조회
            @RequestParam(value = "cursor", required = false) Long cursor,
            @RequestParam(value = "limit", required = false) Integer limit) {
        
        // Service를 통해 제안된 프로젝트 목록 조회
        SuggestedProjectListResponse result = userSuggestedService.getSuggestedProjects(userId, type, cursor, limit);
        
        // 성공 응답 반환
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }
}