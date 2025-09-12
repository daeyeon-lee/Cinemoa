package io.ssafy.cinemoa.payment.repository;

import io.ssafy.cinemoa.payment.repository.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}
