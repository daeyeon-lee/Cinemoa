package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

/**
 * 계좌 유효성 검증 응답 DTO (REC 영역)
 */
@Data
public class AccountVerifyResponse {
    private String bankCode;             // 은행 코드
    private String bankName;             // 은행 이름
    private String userName;             // 예금주 이름
    private String accountNo;            // 계좌번호
    private String accountName;          // 계좌 상품명
    private String accountTypeCode;      // 계좌 유형 코드
    private String accountTypeName;      // 계좌 유형 이름
    private String accountCreatedDate;   // 계좌 개설일 (YYYYMMDD)
    private String accountExpiryDate;    // 계좌 만기일 (YYYYMMDD)
    private String dailyTransferLimit;   // 1일 이체 한도a
    private String oneTimeTransferLimit; // 1회 이체 한도
    private String accountBalance;       // 계좌 잔액
    private String lastTransactionDate;  // 최종 거래일 (없을 수 있음)
    private String currency;             // 통화 (예: KRW)
}
