package io.ssafy.cinemoa.funding.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingCreateRequest {
    private Long userId;
    private String title;
    private String content;
    private Long categoryId;
    private String videoName;
    private String posterUrl;
    private Long cinemaId;
    private Long screenId;
    private LocalDate screenDay;
    private byte screenStartsOn;
    private byte screenEndsOn;
    private int maxPeople;
}
