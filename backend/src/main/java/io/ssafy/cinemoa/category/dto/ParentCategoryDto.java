package io.ssafy.cinemoa.category.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.util.List;
import java.util.stream.Collectors;
import io.ssafy.cinemoa.category.repository.entity.Category;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParentCategoryDto {
    private Long categoryId;
    private String categoryName;
    private List<ChildCategoryDto> childCategories;

    /**
     * 상위 Category 엔티티와 하위 Category 엔티티 리스트를 ParentCategoryDto로 변환하는 정적 팩토리 메소드
     * @param parentCategory 상위 카테고리 엔티티
     * @param childCategories 하위 카테고리 엔티티 리스트
     * @return 변환된 ParentCategoryDto 객체
     */
    // {
    //     "categoryId": 1,
    //     "categoryName": "영화",
    //     "childCategories": [
    //         {
    //             "categoryId": 2,
    //             "categoryName": "액션"
    //         }
    //     ]
    // }
    // of(parent, children) 정적 팩토리 메소드 : 역할: 상위 카테고리 Category 엔티티 1개와, 그에 속한 하위 카테고리 Category 엔티티들의 List를 받아 ParentCategoryDto 하나 완성
    public static ParentCategoryDto of(Category parentCategory, List<Category> childCategories) {
        return ParentCategoryDto.builder()
            .categoryId(parentCategory.getCategoryId())
            .categoryName(parentCategory.getTagName())
            .childCategories(childCategories.stream().map(ChildCategoryDto::from).collect(Collectors.toList()))
            .build();
    }
}
