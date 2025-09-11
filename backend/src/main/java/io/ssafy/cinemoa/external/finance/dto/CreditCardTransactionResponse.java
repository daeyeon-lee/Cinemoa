package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

@Data
public class CreditCardTransactionResponse {
    // 응답 헤더 정보
    private String responseCode;
    private String responseMessage;

    // 거래 정보
    private String transactionUniqueNo;
    private String categoryId;
    private String categoryName;
    private String merchantId;
    private String merchantName;
    private String transactionDate;
    private String transactionTime;
    private String paymentBalance;
}