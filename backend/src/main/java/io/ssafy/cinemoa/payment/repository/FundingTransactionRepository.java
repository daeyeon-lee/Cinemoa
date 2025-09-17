package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.payment.enums.FundingTransactionState;
import io.ssafy.cinemoa.payment.repository.entity.FundingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FundingTransactionRepository extends JpaRepository<FundingTransaction, Long> {
  /**
   * 펀딩 ID와 상태로 FundingTransaction 존재 여부 확인
   */
  boolean existsByFunding_FundingIdAndState(Long fundingId, FundingTransactionState state);
}
