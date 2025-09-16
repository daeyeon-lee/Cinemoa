package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.common.FinanceApiUtils;
import io.ssafy.cinemoa.external.finance.common.HttpClientUtil;
import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyResponse;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

/**
 * ✅ AccountVerifyApiClient
 * - 외부 금융망 API 중 "계좌 유효성 검증"만 담당
 * - 헤더 생성/거래번호 생성은 공용 유틸(FinanceHttp / TransactionNoGenerator) 사용
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountVerifyApiClient {

    private final HttpClientUtil httpClientUtil;
    private final FinanceApiConfig financeApiConfig;

    /**
     * 계좌 유효성 검증 호출
     */

    public AccountVerifyResponse verifyAccount(String accountNo) {
        try {
            // 금융망 API (계좌 조회) 요청 객체 생성
            AccountVerifyRequest request = buildAccountVerifyRequest(accountNo);
            log.info("계좌 조회 (단건) API 호출 시작 - 계좌번호: {}", FinanceApiUtils.maskAccountNumber(accountNo));

            // 계좌 조회 API 호출
            BaseApiResponse<AccountVerifyResponse> responseBody = httpClientUtil.post(
                    financeApiConfig.getAccountVerifyUrl(),
                    request,
                    new ParameterizedTypeReference<BaseApiResponse<AccountVerifyResponse>>() {},
                    "계좌 존재 여부 확인"
            );

            if (responseBody != null) {
                // 응답 코드를 프로젝트 내부 코드로 매핑
                String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
                String apiMsg = responseBody.getHeader().getResponseMessage();
                PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

                // REC 데이터 추출 (실제 응답 정보)
                AccountVerifyResponse result = responseBody.getRec();
                if (result == null) {
                    log.warn("REC 데이터가 null입니다. 빈 응답 객체를 생성합니다.");
                    result = new AccountVerifyResponse();
                }

                // 응답 객체에 프로젝트 내부 코드 설정
                result.setResponseCode(errorCode.getCode()); // PAY_XXXX
                result.setResponseMessage(errorCode.getMessage());

                // 로깅
                if (errorCode.isSuccess()) {
                    log.info("계좌 있음 - 계좌번호: {}", FinanceApiUtils.maskAccountNumber(result.getAccountNo()));
                } else {
                    log.warn("계좌 없음 - 금융망API코드: {}, 금융망API메시지: {} 계좌번호: {}",
                            apiCode,
                            apiMsg,
                            FinanceApiUtils.maskAccountNumber(result.getAccountNo())
                    );
                }

                return result;
            } else {
                log.error("응답 데이터가 null입니다.");
                return createErrorResponse("응답 데이터가 없습니다.");
            }
        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("계좌 조회 (단건) API 호출 실패: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }


    // ======================================= 빌더 =======================================
    // 계좌 조회 API 요청 객체 생성
    private AccountVerifyRequest buildAccountVerifyRequest(String accountNo) {
        // 공통 헤더 생성
        ReqHeader header = FinanceApiUtils.buildCommonHeader(
                financeApiConfig,
                "inquireDemandDepositAccount", false);
        return AccountVerifyRequest.builder()
                .Header(header)
                .accountNo(accountNo)
                .build();
    }

    // 계좌 조회 오류 응답 생성
    private AccountVerifyResponse createErrorResponse(String errorMessage) {
        AccountVerifyResponse errorResponse = new AccountVerifyResponse();

        // 모든 시스템 오류를 PAY_9999로 통일
        PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
        errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
        errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

        return errorResponse;
    }
}


