package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.payment.enums.FundingTransactionState;
import io.ssafy.cinemoa.payment.repository.entity.FundingTransaction;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface FundingTransactionRepository extends JpaRepository<FundingTransaction, Long> {
    /**
     * 펀딩 ID와 상태로 FundingTransaction 존재 여부 확인
     */
    boolean existsByFunding_FundingIdAndState(Long fundingId, FundingTransactionState state);

    /**
     * 사용자가 참여한 펀딩의 성공 거래 목록 조회 (최신순)
     */
    @Query("SELECT ft FROM FundingTransaction ft JOIN FETCH ft.funding WHERE ft.funding.fundingId IN " +
            "(SELECT ut.funding.fundingId FROM UserTransaction ut WHERE ut.user.id = :userId AND ut.state = 'SUCCESS') "
            +
            "AND ft.state = 'SUCCESS' ORDER BY ft.processedAt DESC")
    List<FundingTransaction> findSuccessFundingTransactionsByUserId(@Param("userId") Long userId);
}
