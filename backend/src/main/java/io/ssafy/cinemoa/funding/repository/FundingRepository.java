package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.Funding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundingRepository extends JpaRepository<Funding, Long> {

    
}
