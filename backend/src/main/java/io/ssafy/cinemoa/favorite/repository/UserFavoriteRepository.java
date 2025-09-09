package io.ssafy.cinemoa.favorite.repository;

import io.ssafy.cinemoa.favorite.repository.entity.UserFavorite;
import io.ssafy.cinemoa.favorite.repository.entity.UserFavoriteId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, UserFavoriteId> {
    long deleteById_UserIdAndId_FundingId(Long userId, Long fundingId);
}
