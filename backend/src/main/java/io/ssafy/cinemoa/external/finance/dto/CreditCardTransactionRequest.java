package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CreditCardTransactionRequest {
    @JsonProperty("Header")
    private ReqHeader Header;

    private String cardNo;
    private String cvc;
    private String merchantId;
    private String paymentBalance;
}
