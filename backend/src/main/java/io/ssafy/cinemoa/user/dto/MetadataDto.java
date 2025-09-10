package io.ssafy.cinemoa.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 분류 및 추천 정보를 담는 DTO 클래스
 * 펀딩과 투표의 카테고리 정보를 포함합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetadataDto {
    
    /**
     * 카테고리 ID
     * funding_categories 테이블을 통해 연결된 카테고리 ID
     * funding_tags -> tags 테이블을 통한 연결
     */
    @JsonProperty("categoryId")
    private Long categoryId;

    @JsonProperty("recommendationScore")
    private Integer recommendationScore;
}
