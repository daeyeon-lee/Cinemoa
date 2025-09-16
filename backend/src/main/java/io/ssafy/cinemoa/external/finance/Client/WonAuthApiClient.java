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
import java.lang.reflect.Method;
import java.lang.reflect.ParameterizedType;
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

    // =========================== Public API Methods ===========================

    public WonSendResponse sendOneWon(String accountNo, String authText) {
        WonSendRequest request = buildWonSendRequest(accountNo, authText);
        return callFinanceApi(
                financeApiConfig.getWonSendUrl(),
                request,
                new ParameterizedTypeReference<>() {},
                "1원 송금"
        );
    }

    public WonVerifyResponse checkAuthCode(String accountNo, String authText, String authCode) {
        WonVerifyRequest request = buildWonVerifyRequest(accountNo, authText, authCode);
        return callFinanceApi(
                financeApiConfig.getWonVerifyUrl(),
                request,
                new ParameterizedTypeReference<>() {},
                "1원 인증 검증"
        );
    }

    public TransactionHistoryResponse inquireTransactionHistoryList(
            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
        TransactionHistoryRequest request = buildTransactionHistoryRequest(accountNo, startDate, endDate,
                transactionType, orderByType);
        return callFinanceApi(
                financeApiConfig.getTransactionHistoryUrl(),
                request,
                new ParameterizedTypeReference<>() {},
                "계좌 거래 내역 조회"
        );
    }

    // =========================== Core Logic ===========================

    /**
     * 금융 API 공통 호출 메서드
     */
    private <T> T callFinanceApi(String url, Object request,
                                 ParameterizedTypeReference<BaseApiResponse<T>> responseType,
                                 String operationName) {
        try {
            log.info("{} API 호출 시작", operationName);
            BaseApiResponse<T> responseBody = httpClientUtil.post(url, request, responseType, operationName);
            return processApiResponse(responseBody, operationName, responseType);
        } catch (RestClientException e) {
            log.error("{} API 호출 실패: {}", operationName, e.getMessage(), e);
            return createErrorResponse(responseType, e.getMessage());
        }
    }

    /**
     * API 응답 공통 처리
     */
    private <T> T processApiResponse(BaseApiResponse<T> responseBody, String operationName,
                                     ParameterizedTypeReference<BaseApiResponse<T>> responseType) {
        if (responseBody == null) {
            log.error("응답 데이터가 null입니다.");
            return createErrorResponse(responseType, "응답 데이터가 없습니다.");
        }

        String apiCode = responseBody.getHeader().getResponseCode();
        String apiMsg = responseBody.getHeader().getResponseMessage();
        PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode);

        T result = responseBody.getRec();
        if (result == null) {
            result = createEmptyResponse(responseType);
        }

        // 공통 필드 설정
        setCommonFields(result, errorCode);
        // 통합 로깅
        logApiResult(operationName, errorCode, apiCode, apiMsg);

        return result;
    }

    // =========================== Utility Methods ===========================

    /**
     * 리플렉션으로 공통 응답 필드 설정
     */
    private void setCommonFields(Object response, PaymentErrorCode errorCode) {
        try {
            Method setCode = response.getClass().getMethod("setResponseCode", String.class);
            Method setMessage = response.getClass().getMethod("setResponseMessage", String.class);

            setCode.invoke(response, errorCode.getCode());
            setMessage.invoke(response, errorCode.getMessage());
        } catch (Exception e) {
            log.warn("공통 필드 설정 실패: {}", e.getMessage());
        }
    }

    /**
     * Generic 기반 에러 응답 생성
     */
    private <T> T createErrorResponse(ParameterizedTypeReference<BaseApiResponse<T>> responseType,
                                      String errorMessage) {
        try {
            Class<?> responseClass = extractResponseClass(responseType);
            @SuppressWarnings("unchecked")
            T errorResponse = (T) responseClass.getDeclaredConstructor().newInstance();

            PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
            setCommonFields(errorResponse, systemError);

            // 에러 메시지 추가 설정
            Method setMessage = responseClass.getMethod("setResponseMessage", String.class);
            setMessage.invoke(errorResponse, systemError.getMessage() + ": " + errorMessage);

            return errorResponse;
        } catch (Exception e) {
            log.error("에러 응답 생성 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Generic 기반 빈 응답 객체 생성
     */
    private <T> T createEmptyResponse(ParameterizedTypeReference<BaseApiResponse<T>> responseType) {
        try {
            Class<?> responseClass = extractResponseClass(responseType);
            @SuppressWarnings("unchecked")
            T emptyResponse = (T) responseClass.getDeclaredConstructor().newInstance();
            return emptyResponse;
        } catch (Exception e) {
            log.warn("빈 응답 객체 생성 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * ParameterizedTypeReference에서 실제 응답 클래스 추출
     */
    private Class<?> extractResponseClass(ParameterizedTypeReference<?> responseType) {
        try {
            ParameterizedType paramType = (ParameterizedType) responseType.getType();
            ParameterizedType baseApiResponseType = (ParameterizedType) paramType.getActualTypeArguments()[0];
            return (Class<?>) baseApiResponseType.getActualTypeArguments()[0];
        } catch (Exception e) {
            log.error("응답 클래스 추출 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 통합 로깅
     */
    private void logApiResult(String operation, PaymentErrorCode errorCode, String apiCode, String apiMsg) {
        if (errorCode.isSuccess()) {
            log.info("{} 성공", operation);
        } else {
            log.warn("{} 실패 - API코드: {}, 메시지: {}", operation, apiCode, apiMsg);
        }
    }

    // =========================== Request Builders ===========================

    private WonSendRequest buildWonSendRequest(String accountNo, String authText) {
        ReqHeader header = FinanceApiUtils.buildCommonHeader(financeApiConfig, "openAccountAuth", false);
        return WonSendRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .authText(authText)
                .build();
    }

    private WonVerifyRequest buildWonVerifyRequest(String accountNo, String authText, String authCode) {
        ReqHeader header = FinanceApiUtils.buildCommonHeader(financeApiConfig, "checkAuthCode", false);
        return WonVerifyRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .authText(authText)
                .authCode(authCode)
                .build();
    }

    private TransactionHistoryRequest buildTransactionHistoryRequest(
            String accountNo, String startDate, String endDate, String transactionType, String orderByType) {
        ReqHeader header = FinanceApiUtils.buildCommonHeader(financeApiConfig, "inquireTransactionHistoryList", false);
        return TransactionHistoryRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .startDate(startDate)
                .endDate(endDate)
                .transactionType(transactionType)
                .orderByType(orderByType)
                .build();
    }
}