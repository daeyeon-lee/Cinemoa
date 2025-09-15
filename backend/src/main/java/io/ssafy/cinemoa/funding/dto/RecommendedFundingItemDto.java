package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.funding.enums.FundingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 추천 펀딩 아이템 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendedFundingItemDto {
    
    /**
     * 펀딩 타입 (FUNDING, VOTE)
     */
    @JsonProperty("type")
    private FundingType type;
    
    /**
     * 펀딩 기본 정보
     */
    @JsonProperty("funding")
    private BriefFundingInfo funding;
    
    /**
     * 극장 정보
     */
    @JsonProperty("cinema")
    private BriefCinemaInfo cinema;
    
    /**
     * 메타데이터 (카테고리, 추천 점수)
     */
    @JsonProperty("metadata")
    private MetadataDto metadata;
    
    /**
     * 펀딩 기본 정보 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefFundingInfo {
        
        @JsonProperty("fundingId")
        private Long fundingId;
        
        @JsonProperty("title")
        private String title;
        
        @JsonProperty("summary")
        private String summary;
        
        @JsonProperty("bannerUrl")
        private String bannerUrl;
        
        @JsonProperty("state")
        private String state;
        
        @JsonProperty("progressRate")
        private Integer progressRate;
        
        @JsonProperty("fundingEndsOn")
        private String fundingEndsOn;
        
        @JsonProperty("screenDate")
        private String screenDate;
        
        @JsonProperty("screenMinDate")
        private String screenMinDate;
        
        @JsonProperty("screenMaxDate")
        private String screenMaxDate;
        
        @JsonProperty("price")
        private Integer price;
        
        @JsonProperty("maxPeople")
        private Integer maxPeople;
        
        @JsonProperty("participantCount")
        private Integer participantCount;
        
        @JsonProperty("isLiked")
        private Boolean isLiked;
        
        @JsonProperty("favoriteCount")
        private Integer favoriteCount;
        
        @JsonProperty("viewCount")
        private Integer viewCount;
    }
    
    /**
     * 극장 기본 정보 내부 클래스
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefCinemaInfo {
        
        @JsonProperty("cinemaId")
        private Long cinemaId;
        
        @JsonProperty("cinemaName")
        private String cinemaName;
        
        @JsonProperty("city")
        private String city;
        
        @JsonProperty("district")
        private String district;
    }
}
