package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 추천 펀딩 메타데이터 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetadataDto {
    
    /**
     * 카테고리 ID
     */
    @JsonProperty("categoryId")
    private Long categoryId;
    
    /**
     * 추천 점수 (성공 가능성 기반)
     * 달성률(0.5) + 보고싶어요(0.3) + 조회수(0.2) 가중치 적용
     */
    @JsonProperty("recommendationScore")
    private Double recommendationScore;
}