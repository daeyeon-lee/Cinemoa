package io.ssafy.cinemoa.favorite.repository;

import io.ssafy.cinemoa.favorite.repository.entity.UserFavorite;
import io.ssafy.cinemoa.favorite.repository.entity.UserFavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Set;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavoriteId> {
    long deleteById_UserIdAndId_FundingId(Long userId, Long fundingId);

    boolean existsByUser_IdAndFunding_FundingId(Long id, Long fundingId);
    
    /**
     * 여러 펀딩 중 좋아요를 누른 것들 조회
     * 
     * @param userId 사용자 ID
     * @param fundingIds 펀딩 ID 목록
     * @return 좋아요를 누른 펀딩 ID 목록
     * @author sara
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
     * @author sara
     */
    @Query("SELECT uf.funding.fundingId FROM UserFavorite uf WHERE uf.user.id = :userId")
    List<Long> findLikedFundingIdsByUserId(@Param("userId") Long userId);
}
