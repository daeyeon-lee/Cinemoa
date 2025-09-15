package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<UserTransaction, Long> {
  /**
   * 특정 펀딩의 성공한 거래 수 조회 (참여자 수)
   *
   * @param fundingId 펀딩 ID
   * @return 성공한 거래 수
   * @author sara
   */
  @Query("SELECT COUNT(t) FROM UserTransaction t WHERE t.funding.fundingId = :fundingId AND t.state = 'SUCCESS'")
  long countSuccessfulTransactionsByFundingId(@Param("fundingId") Long fundingId);

  /**
   * 여러 펀딩의 성공한 거래 수 일괄 조회 (참여자 수)
   *
   * @param fundingIds 펀딩 ID 목록
   * @return 펀딩 ID별 성공한 거래 수
   * @author sara
   */
  @Query("SELECT t.funding.fundingId, COUNT(t) FROM UserTransaction t WHERE t.funding.fundingId IN :fundingIds AND t.state = 'SUCCESS' GROUP BY t.funding.fundingId")
  List<Object[]> countSuccessfulTransactionsByFundingIds(@Param("fundingIds") List<Long> fundingIds);

  /**
   * 특정 펀딩의 특정 상태인 거래들을 조회합니다.
   *
   * @param fundingId 펀딩 ID
   * @param state 거래 상태
   * @return 거래 목록
   * @author HG
   */
  List<UserTransaction> findByFunding_FundingIdAndState(Long fundingId, UserTransactionState state);
}
