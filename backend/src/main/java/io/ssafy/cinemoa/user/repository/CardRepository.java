package io.ssafy.cinemoa.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import io.ssafy.cinemoa.user.repository.entity.Card;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
}