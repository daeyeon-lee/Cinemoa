package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserTransactionRepository extends JpaRepository<UserTransaction, Long> {

  /**
   * 펀딩 ID와 상태로 UserTransaction 존재 여부 확인
   */
  boolean existsByFunding_FundingIdAndState(Long fundingId, UserTransactionState state);

  /**
   * 펀딩 ID와 상태로 UserTransaction 목록 조회
   */
  List<UserTransaction> findByFunding_FundingIdAndState(Long fundingId, UserTransactionState state);

  /**
   * 펀딩 ID, 사용자 ID, 상태로 UserTransaction 조회
   */
  Optional<UserTransaction> findByFunding_FundingIdAndUser_IdAndState(Long fundingId, Long userId,
      UserTransactionState state);

  /**
   * 펀딩 ID, 사용자 ID, 상태로 UserTransaction 존재 여부 확인
   */
  boolean existsByFunding_FundingIdAndUser_IdAndState(Long fundingId, Long userId, UserTransactionState state);
}
