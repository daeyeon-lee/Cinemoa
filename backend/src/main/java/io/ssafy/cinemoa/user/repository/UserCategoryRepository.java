package io.ssafy.cinemoa.user.repository;

import io.ssafy.cinemoa.user.repository.entity.UserCategory;
import io.ssafy.cinemoa.user.repository.entity.UserCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserCategoryRepository extends JpaRepository<UserCategory, UserCategoryId> {
    
    // 특정 사용자의 카테고리 목록 조회
    @Query("SELECT uc FROM UserCategory uc WHERE uc.user.id = :userId")
    List<UserCategory> findByUserId(@Param("userId") Long userId);
    
    // 특정 사용자의 카테고리 ID 목록 조회
    @Query("SELECT uc.category.categoryId FROM UserCategory uc WHERE uc.user.id = :userId")
    List<Long> findCategoryIdsByUserId(@Param("userId") Long userId);
    
    // 특정 사용자의 카테고리 삭제
    void deleteByUserId(Long userId);
}
