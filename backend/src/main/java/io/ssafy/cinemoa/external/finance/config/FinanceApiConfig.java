package io.ssafy.cinemoa.external.finance.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class FinanceApiConfig {

    @Value("${finance.api.base-url}")
    private String baseUrl;

    @Value("${finance.api.key}")
    private String apiKey;

    @Value("${finance.api.user-key}")
    private String userKey;

    @Value("${finance.api.institution-code}")
    private String institutionCode;

    @Value("${finance.api.fintech-app-no}")
    private String fintechAppNo;

    @Value("${finance.api.merchant-id}")
    private String merchantId;

    // 카드 결제
    public String getCreditCardTransactionUrl() {
        return baseUrl + "/edu/creditCard/createCreditCardTransaction";
    }
}