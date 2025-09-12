package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.FundingCategory;
import io.ssafy.cinemoa.funding.repository.entity.FundingCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * 펀딩 카테고리 정보 조회를 위한 Repository
 * 
 */
@Repository
public interface FundingCategoryRepository extends JpaRepository<FundingCategory, FundingCategoryId> {
    
    /**
     * 특정 펀딩의 카테고리 ID 조회
     * 
     * @param fundingId 펀딩 ID
     * @return 카테고리 ID (없으면 null)
     * @author sara
     */
    @Query("SELECT fc.category.id FROM FundingCategory fc WHERE fc.funding.fundingId = :fundingId")
    Long findCategoryIdByFundingId(@Param("fundingId") Long fundingId);
    
    /**
     * 특정 펀딩의 카테고리 정보 조회
     * 
     * @param fundingId 펀딩 ID
     * @return 펀딩 카테고리 정보
     * @author sara
     */
    @Query("SELECT fc FROM FundingCategory fc WHERE fc.funding.fundingId = :fundingId")
    FundingCategory findByFundingId(@Param("fundingId") Long fundingId);
    
    /**
     * 여러 펀딩의 카테고리 정보 일괄 조회
     * 
     * @param fundingIds 펀딩 ID 목록
     * @return 펀딩 카테고리 정보 목록
     * @author sara
     */
    @Query("SELECT fc FROM FundingCategory fc WHERE fc.funding.fundingId IN :fundingIds")
    List<FundingCategory> findByFundingIds(@Param("fundingIds") List<Long> fundingIds);
}
