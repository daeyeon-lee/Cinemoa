package io.ssafy.cinemoa.funding.repository.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class FundingCategoryId {
    @Column(name = "funding_id")
    private Long fundingId;

    @Column(name = "category_id")
    private Long categoryId;
}
