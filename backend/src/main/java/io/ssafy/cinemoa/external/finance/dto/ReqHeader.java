package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReqHeader {
  private String apiName;
  private String transmissionDate;
  private String transmissionTime;
  private String institutionCode;
  private String fintechAppNo;
  private String apiServiceCode;
  private String institutionTransactionUniqueNo;
  private String apiKey;
  private String userKey;
}
