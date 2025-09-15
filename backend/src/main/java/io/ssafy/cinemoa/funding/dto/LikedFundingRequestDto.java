package io.ssafy.cinemoa.funding.dto;

import io.ssafy.cinemoa.funding.enums.FundingType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 보고싶어요 한 목록 조회 요청 DTO
 * ParticipatedFundingRequest와 동일한 구조를 가집니다.
 * 
 * API 경로: GET /api/user/{userId}/like
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikedFundingRequestDto {

    /**
     * 펀딩/투표 타입 필터
     * null: 전체, FUNDING: 펀딩만, VOTE: 투표만
     */
    private FundingType type;
    
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
