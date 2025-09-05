package io.ssafy.cinemoa.user.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;

@Embeddable
@EqualsAndHashCode
public class UserFavoriteId {

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "funding_id")
    private Long fundingId;

}
