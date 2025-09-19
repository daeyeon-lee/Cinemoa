package io.ssafy.cinemoa.funding.repository.entity;

import io.ssafy.cinemoa.category.repository.entity.Category;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.global.repository.entity.BaseTimeEntity;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
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
@Table(name = "fundings")
public class Funding extends BaseTimeEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false, name = "funding_id")
    private Long fundingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "screen_id")
    private Screen screen;

    @Column(columnDefinition = "varchar(100)", name = "video_name", nullable = false)
    private String videoName;

    @Column(name = "video_content")
    private String videoContent;

    @Column(name = "max_people", nullable = false)
    private Integer maxPeople;

    @Column(columnDefinition = "varchar(50)")
    private String title;

    @Column(columnDefinition = "varchar(100)")
    private String summary;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "banner_url", nullable = false)
    private String bannerUrl;

    @Column(name = "screen_day")
    private LocalDate screenDay;

    @Column(name = "screen_starts_on", columnDefinition = "tinyint")
    private Byte screenStartsOn;

    @Column(name = "screen_ends_on", columnDefinition = "tinyint")
    private Byte screenEndsOn;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "ends_on")
    private LocalDate endsOn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FundingState state;

    @Enumerated(EnumType.STRING)
    @Column(name = "funding_type", nullable = false)
    private FundingType fundingType;

    @Column(name = "funding_account")
    private String fundingAccount;
}
