package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

/**
 * 계좌 이체 API 요청 DTO
 * 
 * - 금융망 API에 계좌 이체 요청을 보낼 때 사용
 * - 펀딩 계좌에서 영화관 계좌로 송금할 때 사용
 */

@Data
@Builder
public class AccountTransferRequest {

  @JsonProperty("Header")
  private ReqHeader header;

  private String depositAccountNo; // 입금받을 계좌번호 (영화관 계좌)
  private String depositTransactionSummary; // 입금 거래 요약 설명
  private String transactionBalance; // 이체 금액
  private String withdrawalAccountNo; // 출금할 계좌번호 (펀딩 계좌)
  private String withdrawalTransactionSummary; // 출금 거래 요약 설명
}
