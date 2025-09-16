package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

/**
 * 1원 인증 검증 응답 REC
 */
@Data
@Getter
@Setter
public class WonVerifyResponse {
    // 응답 헤더 정보
    private String responseCode;
    private String responseMessage;

    // 1원 인증 검증 응답 정보
    private String status;              // SUCCESS / FAIL
    private String transactionUniqueNo; // 거래 고유 번호
    private String accountNo;           // 계좌번호
}
