package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import io.ssafy.cinemoa.user.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<UserTransaction, Long> {

  /**
   * 특정 사용자와 펀딩의 성공한 거래 목록 조회 (처리완료시각 내림차순)
   */
  Optional<UserTransaction> findTopByUserAndFundingAndStateOrderByProcessedAtDesc(User user, Funding funding,
      UserTransactionState state);
}
