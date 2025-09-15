package io.ssafy.cinemoa.funding.dto;

import io.ssafy.cinemoa.funding.enums.FundingState;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 내가 참여한 목록 조회 요청 DTO
 * 
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParticipatedFundingRequest {

    /**
     * 참여 상태 필터
     * null: 전체, ON_PROGRESS: 진행중, SUCCESS: 성공, FAILED: 실패
     */
    private FundingState state;
    
    /**
     * 다음 데이터 조회를 위한 커서
     * 무한 스크롤을 위한 커서 기반 페이지네이션
     */
    private Long cursor;
    
    /**
     * 한 번에 조회할 개수
     * 기본값: 20
     */
    private Integer limit;
}
