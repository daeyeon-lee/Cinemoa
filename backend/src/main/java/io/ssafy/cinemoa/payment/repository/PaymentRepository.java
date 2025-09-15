package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PaymentRepository extends JpaRepository<UserTransaction, Long> {

}
