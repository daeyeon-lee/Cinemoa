// 참여 및 통계 정보를 담는 DTO 클래스
// "participation": {
// 	      "participantCount": 10,
// 	      "maxPeople": 100,
// 	      "viewCount": 100,
// 	      "likeCount": 100,
// 	      "isLike": true
// 	    }
package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 참여 및 통계 정보를 담는 DTO 클래스
 * 펀딩과 투표 모두에서 사용됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParticipationDto {
    
    /**
     * 현재 모집된 참여자 수
     * funding_stats 테이블의 participant_count 값
     * 펀딩에서만 사용됩니다.
     */
    @JsonProperty("participantCount")
    private Integer participantCount;
    
    /**
     * 목표 달성 인원 수
     * fundings 테이블의 max_people 값
     * 펀딩에서만 사용됩니다.
     */
    @JsonProperty("maxPeople")
    private Integer maxPeople;
    
    /**
     * 조회수
     * funding_stats 테이블의 view_count 값
     */
    @JsonProperty("viewCount")
    private Integer viewCount;
    
    /**
     * 보고싶어요(좋아요) 수
     * funding_stats 테이블의 favorite_count 값
     */
    @JsonProperty("likeCount")
    private Integer likeCount;
    
    /**
     * 현재 사용자가 보고싶어요를 눌렀는지 여부
     * user_favorites 테이블에서 해당 funding_id와 user_id가 존재하는지 확인
     */
    @JsonProperty("isLike")
    private Boolean isLike;
}
