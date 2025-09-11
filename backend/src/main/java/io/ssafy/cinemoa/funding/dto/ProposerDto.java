// 제안자(펀딩/투표 작성자) 정보를 담는 DTO 클래스
// "proposer": {
// 	      "proposerId": 1,
// 	      "creatorNickname": "테스트 닉네임"
// 	    }

package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 제안자(펀딩/투표 작성자) 정보를 담는 DTO 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProposerDto {
    
    /**
     * 제안자(작성자)의 사용자 ID
     * users 테이블의 user_id 값
     */
    @JsonProperty("proposerId")
    private Long proposerId;
    
    /**
     * 제안자(작성자)의 닉네임
     * users 테이블의 nickname 값
     */
    @JsonProperty("creatorNickname")
    private String creatorNickname;
}
