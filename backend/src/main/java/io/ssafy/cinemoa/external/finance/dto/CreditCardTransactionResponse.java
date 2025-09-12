package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;

@Data
public class CreditCardTransactionResponse {
<<<<<<< HEAD
=======
    // 응답 헤더 정보
    private String responseCode;
    private String responseMessage;

    // 거래 정보
>>>>>>> BE
    private String transactionUniqueNo;
    private String categoryId;
    private String categoryName;
    private String merchantId;
    private String merchantName;
    private String transactionDate;
    private String transactionTime;
<<<<<<< HEAD
    private String paymentBalance;
=======
    private Long paymentBalance; // 거래금액
>>>>>>> BE
}