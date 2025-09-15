package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

/**
 * 계좌 이체 API 응답 DTO
 * 
 * - 금융망 API로부터 계좌 이체 결과를 받을 때 사용
 * - 펀딩 계좌에서 영화관 계좌로 송금 결과를 처리할 때 사용
 */

@Data
public class AccountTransferResponse {

  private String responseCode; // 프로젝트 내부 응답 코드 (PAY_XXXX)
  private String responseMessage; // 프로젝트 내부 응답 메시지

  private String transactionUniqueNo; // 거래 고유번호
  private String accountNo; // 계좌번호
  private String transactionDate; // 거래 일자 (이체가 처리된 날짜, YYYYMMDD 형식)
  private String transactionType; // 거래 유형 (1: 입금, 2: 출금)
  private String transactionTypeName; // 거래 유형명 (입금(이체), 출금(이체))
  private String transactionAccountNo; // 상대방 계좌번호
}
