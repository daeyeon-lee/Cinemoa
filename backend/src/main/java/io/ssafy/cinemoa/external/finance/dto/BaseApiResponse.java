package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BaseApiResponse<T> {
  @JsonProperty("Header")
  private ResHeader Header; // 공통 헤더
  @JsonProperty("REC")
  private T REC; // API별 고유 데이터
}
>>>>>>> BE
