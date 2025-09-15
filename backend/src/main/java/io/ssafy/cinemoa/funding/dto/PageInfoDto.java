package io.ssafy.cinemoa.funding.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 페이지 정보를 담는 DTO 클래스
 * Spring Data의 Page 정보를 담습니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PageInfoDto {
    private Integer size;
    private Integer number;
    private Long totalElements;
    private Integer totalPages;
}
