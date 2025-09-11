package io.ssafy.cinemoa.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundingPaymentResponse {
    private String transactionUniqueNo;
    private Long fundingId;
    private Long userId;
    private PaymentInfo paymentInfo;

    @Data
    @Builder
    public static class PaymentInfo {
        private Long amount;
        private String cardNumber;
        private String merchantName;
        private String transactionDate;
        private String transactionTime;
    }
}
