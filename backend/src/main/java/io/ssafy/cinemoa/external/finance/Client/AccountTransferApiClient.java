package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.common.HttpClientUtil;
import io.ssafy.cinemoa.external.finance.common.FinanceApiUtils;
import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountTransferRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountTransferResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.external.finance.enums.TransferType;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

import java.util.List;

/**
 * 금융망 API 계좌 이체 클라이언트
 * 
 * 외부 금융망 API와 통신하여 계좌 이체를 처리합니다.
 * - 금융망 API 호출 및 응답 처리
 * - 외부 API 응답 코드를 프로젝트 내부 코드로 매핑
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountTransferApiClient {

    private final HttpClientUtil httpClientUtil;
    private final FinanceApiConfig financeApiConfig;

    /**
     * 펀딩 성공 시 영화관 송금 처리
     * 
     * - 펀딩 계좌에서 영화관 계좌로 이체
     * 
     * @param fundingAccountNo 펀딩 계좌번호 (출금 계좌)
     * @param cinemaAccountNo  영화관 계좌번호 (입금 계좌)
     * @param transferAmount   송금 금액
     * @param fundingId        펀딩 ID
     * @return 송금 처리 결과
     */
    public AccountTransferResponse processCinemaTransfer(String fundingAccountNo, String cinemaAccountNo,
            String transferAmount, Long fundingId) {
        try {
            // 1. API 요청 객체 생성
            AccountTransferRequest request = buildTransferRequest(TransferType.CINEMA_TRANSFER,
                    fundingAccountNo, cinemaAccountNo, transferAmount, fundingId);

            log.info("영화관 송금 API 호출 시작 - 펀딩계좌: {}, 영화관계좌: {}, 금액: {}, 펀딩ID: {}",
                    FinanceApiUtils.maskAccountNumber(fundingAccountNo),
                    FinanceApiUtils.maskAccountNumber(cinemaAccountNo),
                    transferAmount, fundingId);

            // 2. 공통 API 유틸리티를 사용한 금융망 API 호출
            BaseApiResponse<List<AccountTransferResponse>> responseBody = httpClientUtil.post(
                    financeApiConfig.getAccountTransferUrl(),
                    request,
                    new ParameterizedTypeReference<BaseApiResponse<List<AccountTransferResponse>>>() {
                    },
                    "펀딩계좌 → 영화관계좌 이체");

            if (responseBody != null) {
                // 3. 공통 응답 처리 및 로깅
                return processTransferResponse(responseBody, TransferType.CINEMA_TRANSFER,
                        transferAmount, fundingAccountNo, cinemaAccountNo, fundingId);
            } else {
                log.error("응답 데이터가 null입니다.");
                return createErrorResponse("응답 데이터가 없습니다.");
            }

        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("영화관 송금 API 호출 실패: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }

    /**
     * 펀딩 환불 처리
     * 
     * - 펀딩 계좌에서 사용자 환불 계좌로 이체
     * - 펀딩 참여 취소 시 사용
     * 
     * @param fundingAccountNo    펀딩 계좌번호 (출금 계좌)
     * @param userRefundAccountNo 사용자 환불 계좌번호 (입금 계좌)
     * @param refundAmount        환불 금액
     * @param fundingId           펀딩 ID
     * @return 환불 처리 결과
     */
    public AccountTransferResponse processRefundTransfer(String fundingAccountNo, String userRefundAccountNo,
            String refundAmount, Long fundingId) {
        try {
            // 1. API 요청 객체 생성
            AccountTransferRequest request = buildTransferRequest(TransferType.REFUND,
                    fundingAccountNo, userRefundAccountNo, refundAmount, fundingId);

            log.info("환불 이체 API 호출 시작 - 펀딩계좌: {}, 환불계좌: {}, 금액: {}, 펀딩ID: {}",
                    FinanceApiUtils.maskAccountNumber(fundingAccountNo),
                    FinanceApiUtils.maskAccountNumber(userRefundAccountNo),
                    refundAmount, fundingId);

            // 2. 공통 API 유틸리티를 사용한 금융망 API 호출
            BaseApiResponse<List<AccountTransferResponse>> responseBody = httpClientUtil.post(
                    financeApiConfig.getAccountTransferUrl(),
                    request,
                    new ParameterizedTypeReference<BaseApiResponse<List<AccountTransferResponse>>>() {
                    },
                    "펀딩계좌 → 사용자환불계좌 이체");

            if (responseBody != null) {
                // 3. 공통 응답 처리 및 로깅
                return processTransferResponse(responseBody, TransferType.REFUND,
                        refundAmount, fundingAccountNo, userRefundAccountNo, fundingId);
            } else {
                log.error("응답 데이터가 null입니다.");
                return createErrorResponse("응답 데이터가 없습니다.");
            }

        } catch (RestClientException e) {
            // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
            log.error("환불 이체 API 호출 실패: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }

    /**
     * 계좌이체 API 응답 공통 처리
     * 
     * API 응답에서 REC 데이터를 추출하고 내부 에러 코드로 매핑하며 용도별 로깅 처리
     * 
     * @param responseBody  API 응답 객체
     * @param transferType  이체 타입 (환불/영화관송금)
     * @param amount        이체 금액
     * @param sourceAccount 출금 계좌 (펀딩 계좌)
     * @param targetAccount 입금 계좌 (환불계좌/영화관계좌)
     * @param fundingId     펀딩 ID
     * @return 처리된 AccountTransferResponse 객체
     */
    private AccountTransferResponse processTransferResponse(
            BaseApiResponse<List<AccountTransferResponse>> responseBody,
            TransferType transferType,
            String amount,
            String sourceAccount,
            String targetAccount,
            Long fundingId) {

        // 1. 응답 코드를 프로젝트 내부 코드로 매핑
        String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
        String apiMessage = responseBody.getHeader().getResponseMessage();
        PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

        // 2. REC 데이터 추출 (출금, 입금 정보 리스트 형태)
        List<AccountTransferResponse> recList = responseBody.getRec();
        AccountTransferResponse result = new AccountTransferResponse();

        if (recList != null && !recList.isEmpty()) {
            // 첫 번째 거래 정보를 사용 (출금 거래)
            result = recList.get(0);
        } else {
            log.warn("REC 데이터가 null이거나 비어있습니다.");
        }

        // 3. 응답 객체에 프로젝트 내부 코드 설정
        result.setResponseCode(errorCode.getCode()); // PAY_XXXX
        result.setResponseMessage(errorCode.getMessage());

        // 4. 용도별 로깅 처리
        if (errorCode.isSuccess()) {
            log.info("■■■■■■■■ {} 성공 - 거래번호: {}, 거래일자: {}, 금액: {}, 펀딩ID: {} ■■■■■■■■",
                    transferType.getDescription(),
                    result.getTransactionUniqueNo(),
                    result.getTransactionDate(),
                    amount,
                    fundingId);
        } else {
            log.warn(
                    "■■■■■■■■ {} 실패 - 금융망API코드: {}, 금융망API메시지: {} 내부코드: {}, 메시지: {}, 출금계좌: {}, 입금계좌: {}, 금액: {}, 펀딩ID: {} ■■■■■■■■",
                    transferType.getDescription(),
                    apiCode,
                    apiMessage,
                    errorCode.getCode(),
                    errorCode.getMessage(),
                    FinanceApiUtils.maskAccountNumber(sourceAccount),
                    FinanceApiUtils.maskAccountNumber(targetAccount),
                    amount,
                    fundingId);
        }

        return result;
    }

    /**
     * 계좌이체 API 요청 객체 생성
     * 
     * TransferType에 따라 거래 요약 메시지를 사용하여 요청 객체를 구성
     * 
     * @param transferType     이체 타입 (환불/영화관송금)
     * @param fundingAccountNo 펀딩 계좌번호 (출금 계좌)
     * @param targetAccountNo  대상 계좌번호 (입금 계좌)
     * @param amount           이체 금액
     * @param fundingId        펀딩 ID
     * @return 계좌이체 요청 객체
     */
    private AccountTransferRequest buildTransferRequest(TransferType transferType, String fundingAccountNo,
            String targetAccountNo, String amount, Long fundingId) {

        // 공통 헤더 생성
        ReqHeader header = FinanceApiUtils.buildCommonHeader(
                financeApiConfig,
                "updateDemandDepositAccountTransfer", true);

        // 전체 요청 객체 구성 (헤더 + 계좌 정보)
        return AccountTransferRequest.builder()
                .header(header) // 인증 및 메타데이터
                .depositAccountNo(targetAccountNo) // 입금받을 계좌번호
                .depositTransactionSummary(transferType.getDepositSummary()) // 입금 거래 요약
                .transactionBalance(amount) // 이체금액
                .withdrawalAccountNo(fundingAccountNo) // 출금할 계좌번호 (펀딩 계좌)
                .withdrawalTransactionSummary(transferType.getWithdrawalSummary()) // 출금 거래 요약
                .build();
    }

    /**
     * 오류 응답 생성
     * 
     * API 호출 실패 또는 예외 상황에서 표준화된 오류 응답을 생성
     * 모든 오류는 프로젝트 내부 코드 PAY_9999 (시스템 오류)로 분류
     * 
     * @param errorMessage 상세 오류 메시지
     * @return 시스템 오류 응답 객체
     */
    private AccountTransferResponse createErrorResponse(String errorMessage) {
        AccountTransferResponse errorResponse = new AccountTransferResponse();

        // 모든 시스템 오류를 PAY_9999로 통일
        PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
        errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
        errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

        return errorResponse;
    }
}
