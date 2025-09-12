package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyResponse;

// 공통헤더, 기관거래고유번호 생성용 유틸들
import static io.ssafy.cinemoa.external.finance.support.FinanceHttp.createHeaders;
import static io.ssafy.cinemoa.external.finance.support.TransactionNoGenerator.generateTransactionUniqueNo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ✅ AccountVerifyApiClient
 * - 외부 금융망 API 중 "계좌 유효성 검증"만 담당
 * - 헤더 생성/거래번호 생성은 공용 유틸(FinanceHttp / TransactionNoGenerator) 사용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountVerifyApiClient {

    private final RestTemplate restTemplate;
    private final FinanceApiConfig financeApiConfig;

    /**
     * 계좌 유효성 검증 호출
     */

    public boolean verifyAccount(String accountNo) {
        AccountVerifyRequest request = buildAccountVerifyRequest(accountNo);
        HttpEntity<AccountVerifyRequest> entity = new HttpEntity<>(request, createHeaders());

        ResponseEntity<BaseApiResponse<AccountVerifyResponse>> response =
                restTemplate.exchange(
                        financeApiConfig.getAccountVerifyUrl(),
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<BaseApiResponse<AccountVerifyResponse>>() {}
                );

        BaseApiResponse<AccountVerifyResponse> body = response.getBody();
        String code = (body != null && body.getHeader() != null)
                ? body.getHeader().getResponseCode()
                : null;

        return "H0000".equals(code); // 👈 성공 코드일 때 true 반환
    }


    // ----------------------------- 빌더/유틸 -----------------------------
    private AccountVerifyRequest buildAccountVerifyRequest(String accountNo) {
        ReqHeader header = buildReqHeader("inquireDemandDepositAccount", "inquireDemandDepositAccount");
        return AccountVerifyRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .build();
    }

    private ReqHeader buildReqHeader(String apiName, String apiServiceCode) {
        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        // 기관고유거래번호 생성
        String uniqueNo = generateTransactionUniqueNo();

        return ReqHeader.builder()
                .apiName(apiName)
                .transmissionDate(transmissionDate)
                .transmissionTime(transmissionTime)
                .institutionCode(financeApiConfig.getInstitutionCode())
                .fintechAppNo(financeApiConfig.getFintechAppNo())
                .apiServiceCode(apiServiceCode)
                .institutionTransactionUniqueNo(uniqueNo)
                .apiKey(financeApiConfig.getApiKey())
                .userKey(financeApiConfig.getUserKey())
                .build();
    }

    // 계좌 번호 마스킹
    private String maskAccountNumber(String accountNo) {
        if (accountNo == null || accountNo.length() < 4) return "****";
        int len = accountNo.length();
        return accountNo.substring(0, Math.min(3, len)) + "****" + accountNo.substring(len - 4);
    }
}


