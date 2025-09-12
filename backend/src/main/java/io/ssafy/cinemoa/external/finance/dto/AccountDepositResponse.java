package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

/**
 * 계좌 입금 API 응답 DTO
 * 
 * - 금융망 API로부터 계좌 입금 결과를 받을 때 사용
 */

@Data
public class AccountDepositResponse {

  private String responseCode; // 프로젝트 내부 응답 코드 (PAY_XXXX)
  private String responseMessage; // 프로젝트 내부 응답 메시지

  private String transactionUniqueNo; // 거래 고유번호
  private String transactionDate; // 거래 일자 (입금이 처리된 날짜, YYYYMMDD 형식)

}
