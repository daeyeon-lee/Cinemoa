package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundingStatRepository extends JpaRepository<FundingStat, Long> {
    Optional<FundingStat> findByFunding_FundingId(Long fundingId);
}
