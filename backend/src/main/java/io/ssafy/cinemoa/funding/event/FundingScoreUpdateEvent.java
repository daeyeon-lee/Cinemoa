package io.ssafy.cinemoa.funding.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundingScoreUpdateEvent {
    private Long fundingId;
}
