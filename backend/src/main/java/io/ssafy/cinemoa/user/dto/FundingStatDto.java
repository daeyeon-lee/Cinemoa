package io.ssafy.cinemoa.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 펀딩 통계 정보를 담는 DTO 클래스
 * 펀딩과 투표의 통계 정보를 포함합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingStatDto {
    private Long fundingId;
    private int participantCount;
    private int viewCount;
    private int favoriteCount;
}