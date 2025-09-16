package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.common.FinanceApiUtils;
import io.ssafy.cinemoa.external.finance.common.HttpClientUtil;
import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.external.finance.dto.TransactionHistoryRequest;
import io.ssafy.cinemoa.external.finance.dto.TransactionHistoryResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendRequest;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyRequest;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

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

    private final HttpClientUtil httpClientUtil;
    private final FinanceApiConfig financeApiConfig;

    // ---------------------------------------------------------------------
    // 1원 송금
    // ---------------------------------------------------------------------
    public WonSendResponse sendOneWon(String accountNo, String authText) {
        try {
            // 금융망 API (1원 송금) 요청 객체 생성
            WonSendRequest request = buildWonSendRequest(accountNo, authText);
            log.info("1원 송금 API 호출 시작(openAccountAuth) - 계좌: {}, authText: {}",
                    FinanceApiUtils.maskAccountNumber(accountNo), authText);

            // 1원 송금 API 호출
            BaseApiResponse<WonSendResponse> responseBody = httpClientUtil.post(
                    financeApiConfig.getWonSendUrl(),
                    request,
                    new ParameterizedTypeReference<BaseApiResponse<WonSendResponse>>() {},
                    "1원 송금"
            );

            if (responseBody != null) {
                // 응답 코드를 프로젝트 내부 코드로 매핑
                String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
                String apiMsg = responseBody.getHeader().getResponseMessage();
                PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

                // REC 데이터 추출 (실제 거래 정보)
                WonSendResponse result = responseBody.getRec();
                if (result == null) {
                    log.warn("REC 데이터가 null입니다. 빈 응답 객체를 생성합니다.");
                    result = new WonSendResponse();
                }

                // 응답 객체에 프로젝트 내부 코드 설정
                result.setResponseCode(errorCode.getCode()); // PAY_XXXX
                result.setResponseMessage(errorCode.getMessage());

                // 로깅
                if (errorCode.isSuccess()) {
                    log.info("1원 송금 완료 - 계좌번호: {}", FinanceApiUtils.maskAccountNumber(result.getAccountNo()));
                } else {
                    log.warn("1원 송금 실패 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo())
                    );
                }

                return result;
            } else {
                log.error("응답 데이터가 null입니다.");
                return createWonSendErrorResponse("응답 데이터가 없습니다.");
            }
        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("카드 결제 API 호출 실패: {}", e.getMessage(), e);
            return createWonSendErrorResponse(e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // 1원 인증 검증
    // ---------------------------------------------------------------------
    public WonVerifyResponse checkAuthCode(String accountNo, String authText, String authCode) {
        try {
            // 금융망 API (1원 인증 검증) 요청 객체 생성
            WonVerifyRequest request = buildWonVerifyRequest(accountNo, authText, authCode);
            log.info("1원 인증 검증 API 호출 시작 - 계좌번호: {}, authText: {}, 인증코드: {}",
                    FinanceApiUtils.maskAccountNumber(accountNo), authText, authCode);

            BaseApiResponse<WonVerifyResponse> responseBody = httpClientUtil.post(
                    financeApiConfig.getWonVerifyUrl(),
                    request,
                    new ParameterizedTypeReference<BaseApiResponse<WonVerifyResponse>>() {},
                    "1원 인증 검증"
            );

            if (responseBody != null) {
                // 응답 코드를 프로젝트 내부 코드로 매핑
                String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
                String apiMsg = responseBody.getHeader().getResponseMessage();
                PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

                // REC 데이터 추출 (실제 응답 정보)
                WonVerifyResponse result = responseBody.getRec();
                if (result == null) {
                    log.warn("REC 데이터가 null입니다. 빈 응답 객체를 생성합니다.");
                    result = new WonVerifyResponse();
                }

                // 응답 객체에 프로젝트 내부 코드 설정
                result.setResponseCode(errorCode.getCode()); // PAY_XXXX
                result.setResponseMessage(errorCode.getMessage());

                // 로깅
                if (errorCode.isSuccess()) {
                    log.info("1원 인증 검증 성공 - 계좌번호: {}",
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo()));
                } else if ("A1088".equals(apiCode)) {
                    log.warn("1원 인증 인증코드 불일치 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}, 입력된인증코드{}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo()),
                            authCode
                    );
                } else if ("A1087".equals(apiCode)) {
                    log.warn("1원 인증 인증시간 만료 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}, 요청시간{}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo()),
                            request.getHeader().getTransmissionTime()
                    );
                } else if ("A1090".equals(apiCode)) {
                    log.warn("1원 인증 인증코드 유효하지않음 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}, 입력된인증코드{}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo()),
                            authCode
                    );
                } else {
                    log.warn("1원 인증 검증 실패 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}, 입력된인증코드{}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo()),
                            authCode
                    );
                }

                return result;
            } else {
                log.error("응답 데이터가 null입니다.");
                return createWonVerifyErrorResponse("응답 데이터가 없습니다.");
            }
        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("1원 인증 검증 API 호출 실패: {}", e.getMessage(), e);
            return createWonVerifyErrorResponse(e.getMessage());
        }
    }

    // ---------------------------------------------------------------------
    // 계좌 거래 내역 조회
    // ---------------------------------------------------------------------
    public TransactionHistoryResponse inquireTransactionHistoryList(
            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
        try {
            // 금융망 API (거래 내역 조회) 요청 객체 생성
            TransactionHistoryRequest request =
                    buildTransactionHistoryRequest(accountNo, startDate, endDate, transactionType, orderByType);
            log.info("계좌 거래 내역 조회 API 호출 시작 - 계좌번호: {}, 기간: {}~{}, 구분:{}, 정렬:{}",
                    FinanceApiUtils.maskAccountNumber(accountNo), startDate, endDate, transactionType, orderByType);

            BaseApiResponse<TransactionHistoryResponse> responseBody = httpClientUtil.post(
                    financeApiConfig.getTransactionHistoryUrl(),
                    request,
                    new ParameterizedTypeReference<BaseApiResponse<TransactionHistoryResponse>>() {},
                    "계좌 거래 내역 조회"
            );

            if (responseBody != null) {
                // 응답 코드를 프로젝트 내부 코드로 매핑
                String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
                String apiMsg = responseBody.getHeader().getResponseMessage();
                PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

                // REC 데이터 추출 (실제 응답 정보)
                TransactionHistoryResponse result = responseBody.getRec();
                if (result == null) {
                    log.warn("REC 데이터가 null입니다. 빈 응답 객체를 생성합니다.");
                    result = new TransactionHistoryResponse();
                }

                // 응답 객체에 프로젝트 내부 코드 설정
                result.setResponseCode(errorCode.getCode()); // PAY_XXXX
                result.setResponseMessage(errorCode.getMessage());

                // 로깅
                if (errorCode.isSuccess()) {
                    log.info("계좌 거래내역 조회 성공 - 계좌번호: {}", FinanceApiUtils.maskAccountNumber(request.getAccountNo()));
                } else if (Objects.equals(apiCode, "A1088")) {
                    log.warn("유효하지 않은 계좌 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(request.getAccountNo())
                    );
                } else {
                    log.warn("계좌 거래내역 조회 실패 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(request.getAccountNo())
                    );
                }

                return result;
            } else {
                log.error("응답 데이터가 null입니다.");
                return createTransactionHistoryWonSendErrorResponse("응답 데이터가 없습니다.");
            }
        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("계좌 조회 (단건) API 호출 실패: {}", e.getMessage(), e);
            return createTransactionHistoryWonSendErrorResponse(e.getMessage());
        }
    }


    // ======================================= 빌더 =======================================
    // 1원 송금 API 요청 객체 생성
    private WonSendRequest buildWonSendRequest(String accountNo, String authText) {
        // 공통 헤더 생성
        ReqHeader header = FinanceApiUtils.buildCommonHeader(
                financeApiConfig,
                "openAccountAuth", false);
        return WonSendRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .authText(authText)
                .build();
    }

    // 1원 인증 검증 API 요청 객체 생성
    private WonVerifyRequest buildWonVerifyRequest(String accountNo, String authText, String authCode) {
        // 공통 헤더 생성
        ReqHeader header = FinanceApiUtils.buildCommonHeader(
                financeApiConfig,
                "checkAuthCode", false);
        return WonVerifyRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .authText(authText)
                .authCode(authCode)
                .build();
    }

    // 거래 내역 조회 API 요청 객체 생성
    private TransactionHistoryRequest buildTransactionHistoryRequest(
            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
        // 공통 헤더 생성
        ReqHeader header = FinanceApiUtils.buildCommonHeader(
                financeApiConfig,
                "inquireTransactionHistoryList", false);
        return TransactionHistoryRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .startDate(startDate)
                .endDate(endDate)
                .transactionType(transactionType)
                .orderByType(orderByType)
                .build();
    }

    // 1원 송금 오류 응답 생성
    private WonSendResponse createWonSendErrorResponse(String errorMessage) {
        WonSendResponse errorResponse = new WonSendResponse();

        // 모든 시스템 오류를 PAY_9999로 통일
        PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
        errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
        errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

        return errorResponse;
    }

    // 1원 인증 검증 오류 응답 생성
    private WonVerifyResponse createWonVerifyErrorResponse(String errorMessage) {
        WonVerifyResponse errorResponse = new WonVerifyResponse();

        // 모든 시스템 오류를 PAY_9999로 통일
        PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
        errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
        errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

        return errorResponse;
    }

    // 거래 내역 조회 오류 응답 생성
    private TransactionHistoryResponse createTransactionHistoryWonSendErrorResponse(String errorMessage) {
        TransactionHistoryResponse errorResponse = new TransactionHistoryResponse();

        // 모든 시스템 오류를 PAY_9999로 통일
        PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
        errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
        errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

        return errorResponse;
    }
}
//        // 1. 요청 DTO 생성 (Header + accountNo + authText)
//        WonSendRequest request = buildWonSendRequest(accountNo, authText);
//
//        // 2. 요청 헤더 생성 (Content-Type: application/json 등)
//        HttpEntity<WonSendRequest> entity = new HttpEntity<>(request, createHeaders());
//
//        // 3. 로그 찍기 (민감한 데이터는 일부 마스킹 처리)
//        log.info("1원 송금 API 호출 시작(openAccountAuth) - 계좌: {}, authText: {}",
//                maskAccountNumber(accountNo), authText);
//
//        // 4. HTTP POST 호출
//        ResponseEntity<BaseApiResponse<WonSendResponse>> response =
//                restTemplate.exchange(
//                        financeApiConfig.getWonSendUrl(),
//                        HttpMethod.POST,
//                        entity,
//                        new ParameterizedTypeReference<BaseApiResponse<WonSendResponse>>() {}
//                );
//
//        // 5. 응답 body 꺼내기
//        BaseApiResponse<WonSendResponse> body = response.getBody();
//
//        // 6. 상태 코드만 로그 (성공/실패 여부는 외부 Header.responseCode 참고)
//        log.info("1원 송금 API 응답 수신(openAccountAuth) - HTTP: {}", response.getStatusCode());
//
//        return body;
//    }
//
//    // ---------------------------------------------------------------------
//    // 2) 1원 인증 검증
//    // ---------------------------------------------------------------------
//    public BaseApiResponse<WonVerifyResponse> checkAuthCode(String accountNo, String authText, String authCode) {
//        WonVerifyRequest request = buildWonVerifyRequest(accountNo, authText, authCode);
//        HttpEntity<WonVerifyRequest> entity = new HttpEntity<>(request, createHeaders());
//
//        log.info("1원 인증 검증 API 호출 시작(checkAuthCode) - 계좌번호: {}, authText: {}, 인증코드: {}",
//                maskAccountNumber(accountNo), authText, authCode);
//
//        ResponseEntity<BaseApiResponse<WonVerifyResponse>> response =
//                restTemplate.exchange(
//                        financeApiConfig.getWonVerifyUrl(),
//                        HttpMethod.POST,
//                        entity,
//                        new ParameterizedTypeReference<BaseApiResponse<WonVerifyResponse>>() {}
//                );
//
//        BaseApiResponse<WonVerifyResponse> body = response.getBody();
//        log.info("1원 인증 검증 API 응답 수신(checkAuthCode) - HTTP: {}", response.getStatusCode());
//
//        return body;
//    }
//
//    // ---------------------------------------------------------------------
//    // 3) 거래내역 조회
//    // ---------------------------------------------------------------------
//    public BaseApiResponse<TransactionHistoryResponse> inquireTransactionHistoryList(
//            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
//
//        TransactionHistoryRequest request =
//                buildTransactionHistoryRequest(accountNo, startDate, endDate, transactionType, orderByType);
//        HttpEntity<TransactionHistoryRequest> entity = new HttpEntity<>(request, createHeaders());
//
//        log.info("거래내역 조회 API 호출 시작 - 계좌번호: {}, 기간: {}~{}, 구분:{}, 정렬:{}",
//                maskAccountNumber(accountNo), startDate, endDate, transactionType, orderByType);
//
//        ResponseEntity<BaseApiResponse<TransactionHistoryResponse>> response =
//                restTemplate.exchange(
//                        financeApiConfig.getTransactionHistoryUrl(),
//                        HttpMethod.POST,
//                        entity,
//                        new ParameterizedTypeReference<BaseApiResponse<TransactionHistoryResponse>>() {}
//                );
//
//        BaseApiResponse<TransactionHistoryResponse> body = response.getBody();
//        log.info("거래내역 조회 API 응답 수신 - HTTP: {}", response.getStatusCode());
//
//        return body;
//    }
//
//
//    // =============================== 요청 빌더 ===============================
//
//    private WonSendRequest buildWonSendRequest(String accountNo, String authText) {
//        ReqHeader header = buildReqHeader("openAccountAuth", "openAccountAuth");
//        return WonSendRequest.builder()
//                .Header(header)
//                .accountNo(accountNo)
//                .authText(authText)
//                .build();
//    }
//
//    private WonVerifyRequest buildWonVerifyRequest(String accountNo, String authText, String authCode) {
//        ReqHeader header = buildReqHeader("checkAuthCode", "checkAuthCode");
//        return WonVerifyRequest.builder()
//                .Header(header)
//                .accountNo(accountNo)
//                .authText(authText)
//                .authCode(authCode)
//                .build();
//    }
//
//    private TransactionHistoryRequest buildTransactionHistoryRequest(
//            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
//        ReqHeader header = buildReqHeader("inquireTransactionHistoryList", "inquireTransactionHistoryList");
//        return TransactionHistoryRequest.builder()
//                .Header(header)
//                .accountNo(accountNo)
//                .startDate(startDate)
//                .endDate(endDate)
//                .transactionType(transactionType)
//                .orderByType(orderByType)
//                .build();
//    }
//
//    private ReqHeader buildReqHeader(String apiName, String apiServiceCode) {
//        LocalDateTime now = LocalDateTime.now();
//        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
//        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
//        String uniqueNo = generateTransactionUniqueNo();
//
//        return ReqHeader.builder()
//                .apiName(apiName)
//                .transmissionDate(transmissionDate)
//                .transmissionTime(transmissionTime)
//                .institutionCode(financeApiConfig.getInstitutionCode())
//                .fintechAppNo(financeApiConfig.getFintechAppNo())
//                .apiServiceCode(apiServiceCode)
//                .institutionTransactionUniqueNo(uniqueNo)
//                .apiKey(financeApiConfig.getApiKey())
//                .userKey(financeApiConfig.getUserKey())
//                .build();
//    }
//
//
//    private String maskAccountNumber(String accountNo) {
//        if (accountNo == null || accountNo.length() < 4) return "****";
//        int len = accountNo.length();
//        return accountNo.substring(0, Math.min(3, len)) + "****" + accountNo.substring(len - 4);
//    }

