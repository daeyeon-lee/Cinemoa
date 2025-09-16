package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BaseApiResponse<T> {
  @JsonProperty("Header")
  private ResHeader header; // 공통 헤더
  @JsonProperty("REC")
  private T rec; // API별 고유 데이터
}
