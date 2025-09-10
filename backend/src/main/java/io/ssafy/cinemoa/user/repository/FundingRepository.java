// 내가 제안한 목록 조회 : 핵심 조회 로직 
// (관련 api : /api/user/{userId}/funding-proposals)

package io.ssafy.cinemoa.user.repository;

import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import io.ssafy.cinemoa.user.dto.FundingStatDto;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

@Repository
public interface FundingRepository extends JpaRepository<Funding, Long> {

    // --- 커서가 없을 때 (첫 페이지) ---

    Page<Funding> findByLeader_IdAndFundingTypeOrderByFundingIdDesc(Long leaderId, FundingType fundingType,
            Pageable pageable);

    // 필터링 없이 전체 목록의 첫 페이지를 조회하는 메서드
    Page<Funding> findByLeader_IdOrderByFundingIdDesc(Long leaderId, Pageable pageable);

    // --- 커서가 있을 때 (다음 페이지) ---

    Page<Funding> findByLeader_IdAndFundingIdLessThanAndFundingTypeOrderByFundingIdDesc(Long leaderId, Long fundingId,
            FundingType fundingType, Pageable pageable);

    // 필터링 없이 전체 목록의 다음 페이지를 조회하는 메서드
    Page<Funding> findByLeader_IdAndFundingIdLessThanOrderByFundingIdDesc(Long leaderId, Long fundingId,
            Pageable pageable);

    // 펀딩 통계 정보 조회
    @Query("SELECT new io.ssafy.cinemoa.user.dto.FundingStatDto(fs.funding.fundingId, fs.participantCount, fs.viewCount, fs.favoriteCount) FROM FundingStat fs WHERE fs.funding.fundingId IN :fundingIds")
    List<FundingStatDto> findFundingStatsByFundingIds(@Param("fundingIds") List<Long> fundingIds);

    /**
     * 특정 사용자가 제안한 전체 펀딩/투표 개수를 조회합니다.
     * 
     * @param leaderId 사용자 ID
     * @return 전체 개수
     */
    long countByLeader_Id(Long leaderId);

    /**
     * 특정 사용자가 제안한 특정 타입의 펀딩/투표 개수를 조회합니다.
     * 
     * @param leaderId    사용자 ID
     * @param fundingType 펀딩 타입
     * @return 특정 타입의 전체 개수
     */
    long countByLeader_IdAndFundingType(Long leaderId, FundingType fundingType);
}