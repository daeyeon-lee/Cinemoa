package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

/**
 * 1원 인증 응답 REC
 */
@Data
public class WonSendResponse {
    private String transactionUniqueNo; // 거래 고유 번호
    private String accountNo;           // 계좌번호
}
