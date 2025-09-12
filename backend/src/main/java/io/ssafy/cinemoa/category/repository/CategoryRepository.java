package io.ssafy.cinemoa.category.repository;

import io.ssafy.cinemoa.category.repository.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    
    // 상위 카테고리 조회 (parent_category_id가 null인 카테고리들)
    @Query("SELECT c FROM Category c WHERE c.category IS NULL")
    List<Category> findParentCategories();
    
    // 하위 카테고리 조회 (parent_category_id가 null이 아닌 카테고리들)
    @Query("SELECT c FROM Category c WHERE c.category IS NOT NULL")
    List<Category> findSubCategories();
    
    // 특정 부모 카테고리의 하위 카테고리 조회
    @Query("SELECT c FROM Category c WHERE c.category.categoryId = :parentId")
    List<Category> findSubCategoriesByParentId(@Param("parentId") Long parentId);
}
