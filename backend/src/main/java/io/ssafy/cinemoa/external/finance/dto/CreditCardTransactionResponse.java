package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

@Data
public class CreditCardTransactionResponse {
    private String transactionUniqueNo;
    private String categoryId;
    private String categoryName;
    private String merchantId;
    private String merchantName;
    private String transactionDate;
    private String transactionTime;
    private String paymentBalance;
}