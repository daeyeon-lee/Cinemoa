package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface FundingStatRepository extends JpaRepository<FundingStat, Long> {
    Optional<FundingStat> findByFunding_FundingId(Long fundingId);

    @Modifying
    @Transactional
    @Query("UPDATE FundingStat fs SET fs.participantCount = fs.participantCount + 1 WHERE fs.funding.fundingId = :fundingId")
    void incrementParticipantCount(@Param("fundingId") Long fundingId);

    @Modifying
    @Transactional
    @Query("UPDATE FundingStat fs SET fs.participantCount = fs.participantCount - 1 WHERE fs.funding.fundingId = :fundingId")
    void decrementParticipantCount(@Param("fundingId") Long fundingId);

    @Modifying
    @Transactional
    @Query("update FundingStat fs SET fs.viewCount = fs.viewCount + 1 WHERE fs.funding.fundingId = :fundingId")
    void incrementViewCount(@Param("fundingId") Long fundingId);

    @Modifying
    @Transactional
    @Query("update FundingStat fs SET fs.favoriteCount = fs.favoriteCount + 1, fs.viewCount = fs.viewCount + 1 WHERE fs.funding.fundingId = :fundingId")
    void incrementFavoriteCount(@Param("fundingId") Long fundingId);
}
