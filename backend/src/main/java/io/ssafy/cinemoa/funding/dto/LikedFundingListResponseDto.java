package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 보고싶어요 한 목록 조회 API의 최종 응답 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/like
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikedFundingListResponseDto {
    
    /**
     * 보고싶어요 한 펀딩/투표 목록
     * 최신순으로 정렬됩니다.
     */
    @JsonProperty("content")
    private List<LikedFundingItemDto> content;
    
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
