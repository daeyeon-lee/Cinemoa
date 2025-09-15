// 제안된 프로젝트(펀딩/투표) 항목을 담는 DTO 클래스
package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import com.fasterxml.jackson.annotation.JsonInclude; // null 값 제외

/**
 * 제안된 프로젝트(펀딩/투표) 항목을 담는 DTO 클래스
 * 펀딩과 투표를 구분하여 하나의 리스트에서 관리합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SuggestedProjectItemDto {
    
    /**
     * 프로젝트 타입
     * "funding" 또는 "vote" 값
     * 쿼리 파라미터 type 값과 동일
     */
    @JsonProperty("type")
    private String type;
    
    /**
     * 펀딩 정보
     * type이 "funding"일 때만 사용됩니다.
     */
    @JsonProperty("funding")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private FundingInfoDto funding;
    
    /**
     * 투표 정보
     * type이 "vote"일 때만 사용됩니다.
     * FundingInfoDto를 공통으로 사용합니다.
     */
    @JsonProperty("vote")
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private FundingInfoDto vote;
    
    /**
     * 제안자(작성자) 정보
     * 펀딩과 투표 모두에서 사용됩니다.
     */
    @JsonProperty("proposer")
    private ProposerDto proposer;
    
    /**
     * 상영 정보
     * 펀딩과 투표 모두에서 사용됩니다.
     */
    @JsonProperty("screening")
    private ScreeningDto screening;
    
    /**
     * 참여 및 통계 정보
     * 펀딩과 투표 모두에서 사용됩니다.
     */
    @JsonProperty("participation")
    private ParticipationDto participation;
    
    /**
     * 분류 및 추천 정보
     * 펀딩과 투표 모두에서 사용됩니다.
     */
    @JsonProperty("metadata")
    private MetadataDto metadata;
    
    /**
     * 극장 정보
     * 펀딩과 투표 모두에서 사용됩니다.
     */
    @JsonProperty("cinema")
    private BriefCinemaInfo cinema;
    
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
