package io.ssafy.cinemoa.funding.dto;

import io.ssafy.cinemoa.funding.enums.FundingState;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {

    private BriefFundingInfo funding;
    private BriefCinemaInfo cinema;


    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefFundingInfo {
        private Long fundingId;
        private String title;
        private String bannerUrl;
        private FundingState state;
        private Integer progressRate;
        private LocalDate fundingEndsOn;
        private LocalDate screenDate;
        private Integer price;
        private Integer maxPeople;
        private Integer participantCount;
        private Integer favoriteCount;
        private Boolean isLiked;
        private String fundingType;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefCinemaInfo {
        private Long cinemaId;
        private String cinemaName;
        private String city;
        private String district;
    }
}
