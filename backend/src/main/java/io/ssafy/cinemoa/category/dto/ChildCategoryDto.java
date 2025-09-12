package io.ssafy.cinemoa.category.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import io.ssafy.cinemoa.category.repository.entity.Category;

/**
 * 하위 카테고리 정보를 담는 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChildCategoryDto {
    private Long categoryId;
    private String categoryName;

    /**
     * Category 엔티티를 ChildCategoryDto로 변환하는 메서드
     * @param category 변환할 Category 엔티티
     * @return 변환된 ChildCategoryDto 객체
     */
    // {
    //     "categoryId": 2,
    //     "categoryName": "액션"
    //   }

    public static ChildCategoryDto from(Category category) {
        return ChildCategoryDto.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getTagName()) // DB에서 조회한 Entity의 tagName을 DTO 필드에 매핑
                .build();
    }
}
