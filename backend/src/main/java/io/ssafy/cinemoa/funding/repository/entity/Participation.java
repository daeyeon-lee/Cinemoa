package io.ssafy.cinemoa.funding.repository.entity;

import io.ssafy.cinemoa.funding.enums.ParticipationState;
import io.ssafy.cinemoa.global.repository.entity.BaseTimeEntity;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "participations")
public class Participation extends BaseTimeEntity {

    @EmbeddedId
    private ParticipationId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("fundingId")
    @JoinColumn(name = "funding_id", nullable = false)
    private Funding funding;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ParticipationState state;

}
