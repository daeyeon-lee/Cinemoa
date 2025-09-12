package io.ssafy.cinemoa.category.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

/* 
 * 모든 카테고리 조회 API 응답의 data 필드에 해당하는 DTO
 */

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryListResponseDto {
    private List<ParentCategoryDto> items;

    /**
     * ParentCategoryDto 리스트를 CategoryListResponseDto로 변환하는 정적 팩토리 메소드
     * @param items 상위 카테고리 리스트
     * @return 변환된 CategoryListResponseDto 객체
     */
    // "data": {
    //     "items": [ ... ], // ParentCategoryDto 객체들의 리스트
    //     "totalCount": 20
    // }
    public static CategoryListResponseDto of(List<ParentCategoryDto> items) {
        return CategoryListResponseDto.builder()
            .items(items)
            .build();
    }
}
