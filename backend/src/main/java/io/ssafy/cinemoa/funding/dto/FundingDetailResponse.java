package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingDetailResponse {

    private FundingType type;
    private FundingInfo funding;
    private ProposerInfo proposer;
    private VideoInfo screening;
    private FundingStatInfo stat;
    private CategoryInfo category;
    private ScreenInfo screen;
    private CinemaInfo cinema;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FundingInfo {
        private Long fundingId;
        private String title;
        private String bannerUrl;
        private String content;
        private FundingState state;
        private Integer progressRate;
        private LocalDate fundingEndsOn;
        private LocalDate screenMinDate;
        private LocalDate screenMaxDate;
        private Integer price;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProposerInfo {
        private Long proposerId;
        private String nickname;
        private String profileImgUrl;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VideoInfo {
        private String videoName;
        private String videoContent;
        private String screeningTitle;
        private Byte screenStartsOn;
        private Byte screenEndsOn;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FundingStatInfo {
        private Integer maxPeople;
        private Integer participantCount;
        private Integer viewCount;
        private Integer likeCount;
        private Boolean isLiked;
        private Boolean isParticipated;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryInfo {
        private Long categoryId;
        private String categoryName;
        private Long parentCategoryId;
        private String parentCategoryName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScreenInfo {
        private Long screenId;
        private String screenName;
        @JsonProperty("isImax")
        private Boolean isImax;
        @JsonProperty("isScreenx")
        private Boolean isScreenx;
        @JsonProperty("is44dx")
        private Boolean is4dx;
        @JsonProperty("isDolby")
        private Boolean isDolby;
        @JsonProperty("isRecliner")
        private Boolean isRecliner;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CinemaInfo {
        private Long cinemaId;
        private String cinemaName;
        private String city;
        private String district;
    }
}
