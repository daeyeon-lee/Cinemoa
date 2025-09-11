// 상영 정보를 담는 DTO 클래스
// "screening": {
// 	      "videoName": "영화 제목",
// 	      "screeningTitle": "상영회 제목",
// 	      "screenStartsOn": "2025-09-20T19:00:00+09:00",
// 	      "screenEndsOn": "2025-09-20T21:00:00+09:00"
// 	    }
package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 상영 정보를 담는 DTO 클래스
 * 펀딩과 투표 모두에서 사용됩니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningDto {
    
    /**
     * 상영물 명칭 (영화 제목)
     * fundings 테이블의 video_name 값
     */
    @JsonProperty("videoName")
    private String videoName;
    
    /**
     * 상영 시작 시간
     * fundings 테이블의 screen_starts_on(int) 값(예. 15)
     */
    @JsonProperty("screenStartsOn")
    private Integer screenStartsOn;
    
    /**
     * 상영 종료 시간
     * fundings 테이블의 screen_ends_on(int) 값(예. 17)
     */
    @JsonProperty("screenEndsOn")
    private Integer screenEndsOn;
}
