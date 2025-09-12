// 페이징 정보를 담는 DTO 클래스
// "pagination": {
// 	      "nextCursor": "eyJpZCI6MTE1fQ==",
// 	      "hasNext": true,
// 	      "totalCount": 47
// 	    }

package io.ssafy.cinemoa.funding.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 스크롤 정보를 담는 DTO 클래스
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginationDto {
    
    /**
     * 다음 스크롤 추가 데이터 조회를 위한 커서 값
     */
    @JsonProperty("nextCursor")
    private Long nextCursor;
    
    /**
     * 다음 스크롤 추가 데이터가 존재하는지 여부
     * true: 다음 스크롤 추가 데이터 있음, false: 마지막 스크롤 추가 데이터
     */
    @JsonProperty("hasNext")
    private Boolean hasNext;
    
    /**
     * 전체 데이터 개수
     * 필터링 조건에 맞는 전체 데이터의 총 개수
     */
    @JsonProperty("totalCount")
    private Long totalCount;
}
