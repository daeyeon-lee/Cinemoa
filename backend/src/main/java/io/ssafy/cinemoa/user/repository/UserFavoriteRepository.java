package io.ssafy.cinemoa.user.repository;

import io.ssafy.cinemoa.user.repository.entity.UserFavorite;
import io.ssafy.cinemoa.user.repository.entity.UserFavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Set;

/**
 * 사용자 좋아요 정보 조회를 위한 Repository
 * 
 */
@Repository
public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavoriteId> {
    
    /**
     * 특정 사용자가 특정 펀딩에 좋아요를 눌렀는지 확인
     * 
     * @param userId 사용자 ID
     * @param fundingId 펀딩 ID
     * @return 좋아요 여부
     */
    @Query("SELECT CASE WHEN COUNT(uf) > 0 THEN true ELSE false END " +
           "FROM UserFavorite uf " +
           "WHERE uf.user.id = :userId AND uf.funding.fundingId = :fundingId")
    Boolean existsByUserIdAndFundingId(@Param("userId") Long userId, @Param("fundingId") Long fundingId);
    
    /**
     * 여러 펀딩 중 좋아요를 누른 것들 조회
     * 
     * @param userId 사용자 ID
     * @param fundingIds 펀딩 ID 목록
     * @return 좋아요를 누른 펀딩 ID 목록
     */
    @Query("SELECT uf.funding.fundingId FROM UserFavorite uf " +
           "WHERE uf.user.id = :userId AND uf.funding.fundingId IN :fundingIds")
    Set<Long> findLikedFundingIdsByUserIdAndFundingIds(
            @Param("userId") Long userId, 
            @Param("fundingIds") List<Long> fundingIds);
    
    /**
     * 사용자가 좋아요를 누른 모든 펀딩 ID 조회
     * 
     * @param userId 사용자 ID
     * @return 좋아요를 누른 펀딩 ID 목록
     */
    @Query("SELECT uf.funding.fundingId FROM UserFavorite uf WHERE uf.user.id = :userId")
    List<Long> findLikedFundingIdsByUserId(@Param("userId") Long userId);
    
}
