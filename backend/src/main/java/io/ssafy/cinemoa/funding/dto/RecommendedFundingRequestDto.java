package io.ssafy.cinemoa.funding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 추천 펀딩 목록 조회 요청 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedFundingRequestDto {
    
    /**
     * 펀딩/투표 타입 필터 (funding, vote)
     */
    private String type;
    
    /**
     * 다음 페이지 조회를 위한 커서
     */
    private Long cursor;
    
    /**
     * 한 번에 조회할 개수
     */
    private Integer limit;
}
