package io.ssafy.cinemoa.category.repository;

import io.ssafy.cinemoa.category.repository.entity.Category;
import java.util.List;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // 상위 카테고리 조회 (parent_category_id가 null인 카테고리들)
    @Query("SELECT c FROM Category c WHERE c.parentCategory IS NULL")
    List<Category> findParentCategories();

    // 하위 카테고리 조회 (parent_category_id가 null이 아닌 카테고리들)
    @Query("SELECT c FROM Category c WHERE c.parentCategory IS NOT NULL")
    List<Category> findSubCategories();

    @Query("SELECT c.id FROM Category c WHERE c.parent.id IN :parentIds")
    List<Long> findSubCategoryIdsByParentIds(@Param("parentIds") Set<Long> parentIds);

    @Query("SELECT c FROM Category c WHERE c.parentCategory.categoryId = :parentId")
    List<Category> findSubCategoriesByParentId(@Param("parentId") Long parentId);

    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.parentCategory.categoryId = :categoryId")
    boolean isParent(@Param("categoryId") Long categoryId);
}
