package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.ssafy.cinemoa.funding.enums.FundingState;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipatedFundingInfoDto {

    private BriefFundingInfo funding;
    private BriefCinemaInfo cinema;

    @JsonIgnore
    private LocalDateTime timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefFundingInfo {
        private Long fundingId;
        private String title;
        private String bannerUrl;
        private String ticketBanner;
        private FundingState state;
        private Integer progressRate;
        private LocalDate fundingEndsOn;
        private String videoName;
        private LocalDate screenDate;
        private LocalDate screenMinDate;
        private LocalDate screenMaxDate;
        private Integer price;
        private Integer maxPeople;
        private Integer viewCount;
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
