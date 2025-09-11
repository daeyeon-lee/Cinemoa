package io.ssafy.cinemoa.favorite.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@EqualsAndHashCode
@NoArgsConstructor
@AllArgsConstructor
public class UserFavoriteId {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "funding_id")
    private Long fundingId;

}
