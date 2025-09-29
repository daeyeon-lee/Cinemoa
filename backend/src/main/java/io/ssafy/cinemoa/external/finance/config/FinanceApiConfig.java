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

    @Value("${finance.api.user-key}") // 향후 삭제 가능
    private String userKey;

    @Value("${finance.api.admin-user-key}") // 향후 삭제 가능
    private String adminUserKey;

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

    public String getAccountCreateUrl() {
        return baseUrl + "/edu/demandDeposit/createDemandDepositAccount";
    }

    // 계좌 입금
    public String getAccounDepositUrl() {
        return baseUrl + "/edu/demandDeposit/updateDemandDepositAccountDeposit";
    }

    // 계좌 이체
    public String getAccountTransferUrl() {
        return baseUrl + "/edu/demandDeposit/updateDemandDepositAccountTransfer";
    }

    // 계좌 확인
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