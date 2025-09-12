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

    @Value("${finance.api.admin-user-key}")
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

    // 계좌 조회 (단건) (유효한 계좌인지 확인할 때 사용)
    public String getAccountVerifyUrl() {
        return baseUrl + "/edu/demandDeposit/inquireDemandDepositAccount";
    }

    // 1원 송금
    public String getWonSendUrl() {
        return baseUrl + "/edu/accountAuth/openAccountAuth";
    }

    // 1원 검증
    public String getWonVerifyUrl() {
        return baseUrl + "/edu/accountAuth/checkAuthCode";
    }

    // 결제내역 조회
    public String getTransactionHistoryUrl() {
        return baseUrl + "/edu/demandDeposit/inquireTransactionHistoryList";
    }
}