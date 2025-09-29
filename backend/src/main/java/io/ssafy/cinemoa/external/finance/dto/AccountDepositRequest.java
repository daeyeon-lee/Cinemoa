package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

/**
 * 계좌 입금 API 요청 DTO
 * 
 * - 금융망 API에 계좌 입금 요청을 보낼 때 사용
 */

@Data
@Builder
public class AccountDepositRequest {

  @JsonProperty("Header")
  private ReqHeader Header;

  private String accountNo; // 입금할 계좌번호
  private String transactionBalance; // 입금 금액
  private String transactionSummary; // 거래 요약 설명
}
