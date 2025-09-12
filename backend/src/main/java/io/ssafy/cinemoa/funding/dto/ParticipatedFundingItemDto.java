package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 내가 참여한 펀딩 항목을 담는 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipatedFundingItemDto {
    
    /**
     * 펀딩 정보
     */
    @JsonProperty("funding")
    private BriefFundingInfo funding;
    
    /**
     * 극장 정보
     */
    @JsonProperty("cinema")
    private BriefCinemaInfo cinema;
    
    /**
     * 펀딩 기본 정보를 담는 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefFundingInfo {
        private Long fundingId;
        private String title;
        private String bannerUrl;
        private String state;
        private Integer progressRate;
        private String fundingEndsOn;
        private String screenDate;
        private Integer price;
        private Integer maxPeople;
        private Integer participantCount;
        private Integer favoriteCount;
        private Boolean isLiked;
        private String fundingType;
    }
    
    /**
     * 극장 기본 정보를 담는 내부 클래스
     */
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
