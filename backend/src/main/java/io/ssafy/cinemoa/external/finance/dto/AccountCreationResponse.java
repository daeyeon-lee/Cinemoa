package io.ssafy.cinemoa.external.finance.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreationResponse {

    private String responseCode;
    private String responseMessage;

    private String bankCode;
    private String accountNo;
    private CurrencyInfo currency;


    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CurrencyInfo {
        private String currency;
        private String currencyName;
    }
}
