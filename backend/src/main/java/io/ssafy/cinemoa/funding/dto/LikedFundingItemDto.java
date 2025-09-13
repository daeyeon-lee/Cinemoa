package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.funding.enums.FundingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 보고싶어요 한 펀딩/투표 항목을 담는 DTO 클래스
 * 
 * API 경로: GET /api/user/{userId}/like
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LikedFundingItemDto {
    
    /**
     * 펀딩/투표 타입
     * FUNDING 또는 VOTE
     */
    @JsonProperty("type")
    private FundingType type;
    
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
     * 펀딩과 투표 모두에서 사용되지만 필드가 다름
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BriefFundingInfo {
        private Long fundingId;
        private String title;
        private String summary;
        private String bannerUrl;
        private String state;
        private Integer progressRate;
        
        // 펀딩 전용 필드
        private String fundingEndsOn;  // 펀딩 종료일
        private String screenDate;     // 상영일
        private Integer price;         // 가격
        private Integer maxPeople;     // 최대 인원
        private Integer participantCount; // 참여자 수
        
        // 투표 전용 필드
        private String screenMinDate; // 투표 최소 상영일
        private String screenMaxDate; // 투표 최대 상영일
        
        // 공통 필드
        private Integer favoriteCount; // 좋아요 수
        private Boolean isLiked;      // 현재 사용자 좋아요 여부
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
