package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;

// --- 우리가 만든 DTO들 import ---
import io.ssafy.cinemoa.external.finance.dto.WonSendRequest;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyRequest;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.external.finance.dto.TransactionHistoryRequest;
import io.ssafy.cinemoa.external.finance.dto.TransactionHistoryResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * ✅ WonAuthApiClient
 * - "외부 금융망 API"를 호출하기 위한 클라이언트 클래스
 * - RestTemplate을 사용해 HTTP 요청/응답을 처리함
 *
 * 지원 기능
 * 1. openAccountAuth : 1원 송금 시작 (WonSend)
 * 2. checkAuthCode   : 1원 인증 검증 (WonVerify)
 * 3. inquireTransactionHistoryList : 계좌 거래내역 조회
 */

@Slf4j
@Component
@RequiredArgsConstructor
public class WonAuthApiClient {

    private final RestTemplate restTemplate;
    private final FinanceApiConfig financeApiConfig;

    // ---------------------------------------------------------------------
    // 1) 1원 인증 시작: openAccountAuth
    // ---------------------------------------------------------------------
    public BaseApiResponse<WonSendResponse> openAccountAuth(String accountNo, String authText) {
        // 1. 요청 DTO 생성 (Header + accountNo + authText)
        WonSendRequest request = buildWonSendRequest(accountNo, authText);

        // 2. 요청 헤더 생성 (Content-Type: application/json 등)
        HttpEntity<WonSendRequest> entity = new HttpEntity<>(request, createHeaders());

        // 3. 로그 찍기 (민감한 데이터는 일부 마스킹 처리)
        log.info("1원 송금 API 호출 시작(openAccountAuth) - 계좌: {}, authText: {}",
                maskAccountNumber(accountNo), authText);

        // 4. 실제 HTTP POST 호출
        ResponseEntity<BaseApiResponse<WonSendResponse>> response =
                restTemplate.exchange(
                        financeApiConfig.getWonSendUrl(),
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<BaseApiResponse<WonSendResponse>>() {}
                );

        // 5. 응답 body 꺼내기
        BaseApiResponse<WonSendResponse> body = response.getBody();

        // 6. 상태 코드만 로그 (성공/실패 여부는 외부 Header.responseCode 참고)
        log.info("1원 송금 API 응답 수신(openAccountAuth) - HTTP: {}", response.getStatusCode());

        return body;
    }

    // ---------------------------------------------------------------------
    // 2) 1원 인증 검증: checkAuthCode → WonVerify
    // ---------------------------------------------------------------------
    public BaseApiResponse<WonVerifyResponse> checkAuthCode(String accountNo, String authText, String authCode) {
        WonVerifyRequest request = buildWonVerifyRequest(accountNo, authText, authCode);
        HttpEntity<WonVerifyRequest> entity = new HttpEntity<>(request, createHeaders());

        log.info("1원 인증 검증 API 호출 시작(checkAuthCode) - 계좌: {}, authText: {}, code: {}",
                maskAccountNumber(accountNo), authText, authCode);

        ResponseEntity<BaseApiResponse<WonVerifyResponse>> response =
                restTemplate.exchange(
                        financeApiConfig.getWonVerifyUrl(),
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<BaseApiResponse<WonVerifyResponse>>() {}
                );

        BaseApiResponse<WonVerifyResponse> body = response.getBody();
        log.info("1원 인증 검증 API 응답 수신(checkAuthCode) - HTTP: {}", response.getStatusCode());

        return body;
    }

    // ---------------------------------------------------------------------
    // 3) 거래내역 조회
    // ---------------------------------------------------------------------
    public BaseApiResponse<TransactionHistoryResponse> inquireTransactionHistoryList(
            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {

        TransactionHistoryRequest request =
                buildTransactionHistoryRequest(accountNo, startDate, endDate, transactionType, orderByType);
        HttpEntity<TransactionHistoryRequest> entity = new HttpEntity<>(request, createHeaders());

        log.info("거래내역 조회 API 호출 시작(inquireTransactionHistoryList) - 계좌: {}, 기간: {}~{}, 구분:{}, 정렬:{}",
                maskAccountNumber(accountNo), startDate, endDate, transactionType, orderByType);

        ResponseEntity<BaseApiResponse<TransactionHistoryResponse>> response =
                restTemplate.exchange(
                        financeApiConfig.getTransactionHistoryUrl(),
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<BaseApiResponse<TransactionHistoryResponse>>() {}
                );

        BaseApiResponse<TransactionHistoryResponse> body = response.getBody();
        log.info("거래내역 조회 API 응답 수신(inquireTransactionHistoryList) - HTTP: {}", response.getStatusCode());

        return body;
    }


    // =============================== 요청 빌더 ===============================

    private WonSendRequest buildWonSendRequest(String accountNo, String authText) {
        ReqHeader header = buildReqHeader("openAccountAuth", "openAccountAuth");
        return WonSendRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .authText(authText)
                .build();
    }

    private WonVerifyRequest buildWonVerifyRequest(String accountNo, String authText, String authCode) {
        ReqHeader header = buildReqHeader("checkAuthCode", "checkAuthCode");
        return WonVerifyRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .authText(authText)
                .authCode(authCode)
                .build();
    }

    private TransactionHistoryRequest buildTransactionHistoryRequest(
            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
        ReqHeader header = buildReqHeader("inquireTransactionHistoryList", "inquireTransactionHistoryList");
        return TransactionHistoryRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .startDate(startDate)
                .endDate(endDate)
                .transactionType(transactionType)
                .orderByType(orderByType)
                .build();
    }

    private ReqHeader buildReqHeader(String apiName, String apiServiceCode) {
        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
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

    // =============================== 공통 유틸 ===============================

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }

    private String generateTransactionUniqueNo() {
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String time = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        int serialNumber = (int) (Math.random() * 1_000_000);
        String serialNumberStr = String.format("%06d", serialNumber);
        return date + time + serialNumberStr;
    }

    private String maskAccountNumber(String accountNo) {
        if (accountNo == null || accountNo.length() < 4) return "****";
        int len = accountNo.length();
        return accountNo.substring(0, Math.min(3, len)) + "****" + accountNo.substring(len - 4);
    }
}
