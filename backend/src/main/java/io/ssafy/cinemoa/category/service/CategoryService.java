package io.ssafy.cinemoa.category.service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import io.ssafy.cinemoa.category.repository.CategoryRepository;
import io.ssafy.cinemoa.category.dto.CategoryListResponseDto;
import io.ssafy.cinemoa.category.dto.ParentCategoryDto;
import io.ssafy.cinemoa.category.repository.entity.Category;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public CategoryListResponseDto getAllCategories() {
        // 1. 상위 카테고리 조회
        List<Category> parentCategories = categoryRepository.findParentCategories();

        // 2. 각 상위 카테고리에 대해 하위 카테고리를 조회하고 DTO로 변환
        List<ParentCategoryDto> parentCategoryDtos = parentCategories.stream()
                .map(parentCategory ->
                        {
                            // 2-1. 특정 상위 카테고리에 속한 하위 카테고리 엔티티들 조회
                            List<Category> childCategories = categoryRepository.findSubCategoriesByParentId(parentCategory.getCategoryId());
                            // 2-2. 상위 카테고리와 하위 카테고리를 ParentCategoryDto로 변환
                            return ParentCategoryDto.of(parentCategory, childCategories);
                        }
                )
                .collect(Collectors.toList());

        // 3. ParentCategoryDto 리스트를 CategoryListResponseDto로 변환
        return CategoryListResponseDto.of(parentCategoryDtos);
    }
}
