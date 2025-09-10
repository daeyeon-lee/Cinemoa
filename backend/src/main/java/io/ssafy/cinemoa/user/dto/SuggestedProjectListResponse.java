package io.ssafy.cinemoa.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 내가 제안한 목록 조회 API의 최종 응답 DTO 클래스
 * 펀딩과 투표 제안 목록을 포함한 무한스크롤 정보를 담습니다.
 * 
 * API 경로: GET /api/user/{userId}/funding-proposals
 * 
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedProjectListResponse {
    
    /**
     * 제안된 프로젝트(펀딩/투표) 목록
     * 펀딩과 투표가 혼합되어 최신순으로 정렬됩니다.
     */
    @JsonProperty("items")
    private List<SuggestedProjectItemDto> items;
    
    /**
     * 페이징 정보
     * 다음에 추가할 데이터를 조회하기 위한 커서와 전체 개수 정보를 포함합니다.
     */
    @JsonProperty("pagination")
    private PaginationDto pagination;
}
