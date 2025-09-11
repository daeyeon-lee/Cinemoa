package io.ssafy.cinemoa.category.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.ssafy.cinemoa.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import io.ssafy.cinemoa.category.dto.CategoryListResponseDto;
import io.ssafy.cinemoa.global.response.ApiResponse;

@RestController
@RequestMapping("/api/category")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    /**
     * 모든 카테고리 목록 조회
     * 
     * @return ResponseEntity<ApiResponse<CategoryListResponseDto>>
     */
    @GetMapping
    public ResponseEntity<ApiResponse<CategoryListResponseDto>> getAllCategories() {
        // 1. 서비스 레이어의 메소드를 호출하여 비즈니스 로직을 수행
        CategoryListResponseDto categoryData = categoryService.getAllCategories();

        // 2. ApiResponse.ofSuccess()를 사용하여 성공 응답 객체를 생성
        ApiResponse<CategoryListResponseDto> response = ApiResponse.ofSuccess(categoryData, "카테고리 조회 성공");
        
        // 3. ResponseEntity.ok()를 사용하여 응답 객체를 생성하고, HTTP 상태 코드 200 (OK)과 함께 성공 응답 반환
        return ResponseEntity.ok(response);
    }
}
