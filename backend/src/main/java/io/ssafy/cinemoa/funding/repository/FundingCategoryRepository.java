package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.FundingCategory;
import io.ssafy.cinemoa.funding.repository.entity.FundingCategoryId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundingCategoryRepository extends JpaRepository<FundingCategory, FundingCategoryId> {
}
