package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.common.FinanceApiUtils;
import io.ssafy.cinemoa.external.finance.common.HttpClientUtil;
import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.AccountCreationRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountCreationResponse;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccountApiClient {

    private final HttpClientUtil httpClientUtil;
    private final FinanceApiConfig financeApiConfig;

    public AccountCreationResponse createAccount() {
        try {
            // 1. API 요청 객체 생성
            AccountCreationRequest request = buildAccountCreationRequest();

            // 2. 공통 API 유틸리티를 사용한 금융망 API 호출
            BaseApiResponse<AccountCreationResponse> responseBody = httpClientUtil.post(
                    financeApiConfig.getAccountCreateUrl(),
                    request,
                    new ParameterizedTypeReference<>() {
                    },
                    "계좌개설");

            if (responseBody != null) {
                // 3. 응답 코드를 프로젝트 내부 코드로 매핑
                String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
                String apiMsg = responseBody.getHeader().getResponseMessage();
                PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

                // REC 데이터 추출 (실제 거래 정보)
                AccountCreationResponse result = responseBody.getREC();
                if (result == null) {
                    log.warn("REC 데이터가 null입니다. 빈 응답 객체를 생성합니다.");
                    result = new AccountCreationResponse();
                }

                // 4. 응답 객체에 프로젝트 내부 코드 설정
                result.setResponseCode(errorCode.getCode()); // PAY_XXXX
                result.setResponseMessage(errorCode.getMessage());

                return result;
            } else {
                log.error("응답 데이터가 null입니다.");
                return createErrorResponse("응답 데이터가 없습니다.");
            }

        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("카드 결제 API 호출 실패: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }

    private AccountCreationResponse createErrorResponse(String errorMessage) {
        AccountCreationResponse errorResponse = new AccountCreationResponse();

        // 모든 시스템 오류를 PAY_9999로 통일
        PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
        errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
        errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

        return errorResponse;
    }


    private AccountCreationRequest buildAccountCreationRequest() {
        // 공통 헤더 생성
        ReqHeader header = FinanceApiUtils.buildCommonHeader(
                financeApiConfig,
                "createDemandDepositAccount");

        return AccountCreationRequest.builder()
                .header(header)
                .build();
    }

}
