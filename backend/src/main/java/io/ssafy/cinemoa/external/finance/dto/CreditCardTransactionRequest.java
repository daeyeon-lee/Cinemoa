package io.ssafy.cinemoa.external.finance.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreditCardTransactionRequest {
    private ReqHeader Header;
    private String cardNo;
    private String cvc;
    private String merchantId;
    private String paymentBalance;
}
