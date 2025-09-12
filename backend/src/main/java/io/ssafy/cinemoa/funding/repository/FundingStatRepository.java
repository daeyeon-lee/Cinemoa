package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FundingStatRepository extends JpaRepository<FundingStat, Long> {
    Optional<FundingStat> findByFunding_FundingId(Long fundingId);

    @Modifying
    @Query("UPDATE FundingStat fs SET fs.currentParticipants = fs.currentParticipants + 1 WHERE fs.funding.fundingId = :fundingId")
    void incrementParticipantCount(@Param("fundingId") Long fundingId);

    @Query("update FundingStat fs SET fs.viewCount = fs.viewCount + 1 WHERE fs.funding.fundingId = :fundingId")
    void incrementViewCount(@Param("fundingId") Long fundingId);
}
