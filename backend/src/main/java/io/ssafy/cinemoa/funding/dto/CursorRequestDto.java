package io.ssafy.cinemoa.funding.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 커서 기반 페이지네이션을 위한 공통 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CursorRequestDto {

    /**
     * 다음 데이터 조회를 위한 커서 무한 스크롤을 위한 커서 기반 페이지네이션
     */
    private String cursor;

    /**
     * 한 번에 조회할 개수 기본값: 20
     */
    private Integer limit;
}
