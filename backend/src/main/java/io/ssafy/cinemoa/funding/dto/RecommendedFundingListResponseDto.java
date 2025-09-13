package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 추천 펀딩 목록 조회 API의 최종 응답 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedFundingListResponseDto {
    
    /**
     * 추천 펀딩/투표 목록
     * 추천 점수 순으로 정렬됩니다.
     */
    @JsonProperty("content")
    private List<RecommendedFundingItemDto> content;
    
    /**
     * 페이지 정보
     * Spring Data의 Page 정보를 담습니다.
     */
    @JsonProperty("page")
    private PageInfoDto page;
    
    /**
     * 무한스크롤을 위한 페이지네이션 정보
     * 다음 데이터 조회를 위한 커서와 상태 정보를 포함합니다.
     */
    @JsonProperty("pagination")
    private PaginationDto pagination;
}
