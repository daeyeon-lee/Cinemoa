package io.ssafy.cinemoa.user.repository;

import io.ssafy.cinemoa.user.repository.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

/**
 * 환불계좌 변경을 위한 Repository
 */
@Repository
public interface RefundAccountUpdateRepository extends JpaRepository<User, Long> {
    
    /**
     * 사용자의 환불계좌 정보를 업데이트
     * @param userId 사용자 ID
     * @param accountNo 새로운 계좌번호
     * @param bankCode 은행코드
     */
    @Modifying
    @Query("UPDATE User u SET u.refundAccountNumber = :accountNo, u.bankCode = :bankCode WHERE u.id = :userId")
    void updateRefundAccount(@Param("userId") Long userId, 
                           @Param("accountNo") String accountNo, 
                           @Param("bankCode") String bankCode);
}
