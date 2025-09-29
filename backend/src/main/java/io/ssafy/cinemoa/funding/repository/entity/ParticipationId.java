package io.ssafy.cinemoa.funding.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class ParticipationId {
    @Column(name = "funding_id")
    private Long fundingId;

    @Column(name = "user_id")
    private Long userId;
}
