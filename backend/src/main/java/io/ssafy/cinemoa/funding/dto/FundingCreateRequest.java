package io.ssafy.cinemoa.funding.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FundingCreateRequest {
    private long userId;
    private String title;
    private String content;
    private long categoryId;
    private String videoName;
    private String posterUrl;
    private long cinemaId;
    private LocalDate screenDay;
    private byte screenStartsOn;
    private byte screenEndsOn;
    private int maxPeople;
}
