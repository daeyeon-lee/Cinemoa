package io.ssafy.cinemoa.external.finance.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class FinanceApiConfig {

    @Value("${finance.api.base-url}")
    private String baseUrl;

    @Value("${finance.api.key}")
    private String apiKey;

<<<<<<< HEAD
    @Value("${finance.api.admin-user-key}")
=======
    @Value("${finance.api.user-key}") // 향후 삭제 가능
>>>>>>> BE
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

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}