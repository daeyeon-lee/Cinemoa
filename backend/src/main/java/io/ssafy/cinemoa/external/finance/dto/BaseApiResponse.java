package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

@Data
public class BaseApiResponse<T> {
  private ResHeader Header; // 공통 헤더
  private T REC; // API별 고유 데이터
}
