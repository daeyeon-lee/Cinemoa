// 펀딩 기본 정보를 담는 DTO 클래스
// "funding": {
// 	      "fundingId": 1,
// 	      "title": "펀딩 제목",
// 	      "bannerUrl": "https://example.com/banner.jpg",
// 	      "state": "SUCCESS",
// 	      "progressRate": 50,
// 	      "fundingStartsOn": "2025-09-20T19:00:00+09:00",
// 	      "fundingEndsOn": "2025-09-20T21:00:00+09:00",
// 	      "price": 10000
// 	    }
package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonInclude; // null 값 제외

/**
 * 펀딩/투표 기본 정보를 담는 DTO 클래스
 * 펀딩과 투표 타입의 제안 목록에서 공통으로 사용됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingInfoDto {
    
    /**
     * 펀딩/투표 ID
     * fundings 테이블의 funding_id 값
     */
    @JsonProperty("fundingId")
    private Long fundingId;
    
    /**
     * 펀딩/투표 제목
     * fundings 테이블의 title 값
     */
    @JsonProperty("title")
    private String title;
    
    /**
     * 펀딩/투표 요약
     * fundings 테이블의 summary 값
     */
    @JsonProperty("summary")
    private String summary;
    
    /**
     * 펀딩/투표 배너 이미지 URL
     * fundings 테이블의 banner_url 값
     */
    @JsonProperty("bannerUrl")
    private String bannerUrl;
    
    /**
     * 펀딩/투표 상태
     * fundings 테이블의 state 값
     * 가능한 값: SUCCESS, EVALUATING, REJECTED, WAITING, ON_PROGRESS, FAILED, VOTING
     */
    @JsonProperty("state")
    private String state;
    
    /**
     * 펀딩 진행률 (백분율)
     * funding_stats.participant_count / fundings.max_people * 100으로 계산
     * 펀딩에서만 사용됩니다.
     */
    @JsonProperty("progressRate")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer progressRate;
    
    /**
     * 펀딩/투표 등록일 (시작일)
     * fundings 테이블의 created_at 값
     * ISO 8601 형식의 날짜/시간 문자열
     */
    @JsonProperty("fundingStartsOn")
    private String fundingStartsOn;
    
    /**
     * 펀딩/투표 종료일
     * fundings 테이블의 ends_on 값
     * ISO 8601 형식의 날짜/시간 문자열 "2025-08-25T14:30:00+09:00"
     */
    @JsonProperty("fundingEndsOn")
    private String fundingEndsOn;
    
    /**
     * 1인당 가격
     * screens.price / fundings.max_people로 계산
     * 펀딩에서만 사용됩니다.
     */
    @JsonProperty("price")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private Integer price;
}
