package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.common.HttpClientUtil;
import io.ssafy.cinemoa.external.finance.common.FinanceApiUtils;
import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountDepositRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountDepositResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;

/**
 * 금융망 API 계좌 입금 클라이언트
 * 
 * 외부 금융망 API와 통신하여 계좌 입금을 처리합니다.
 * - 금융망 API 호출 및 응답 처리
 * - 외부 API 응답 코드를 프로젝트 내부 코드로 매핑
 * - 펀딩별 계좌로 입금 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountDepositApiClient {

  private final HttpClientUtil httpClientUtil;
  private final FinanceApiConfig financeApiConfig;

  /**
   * 계좌 입금 처리
   * 
   * 금융망 API를 호출하여 특정 계좌로 입금을 처리
   * 1. 요청 객체 생성 (헤더 + 계좌 정보)
   * 2. 외부 API 호출
   * 3. 프로젝트 내부 코드로 응답 코드 매핑
   * 4. 로깅 및 에러 처리
   *
   * @param accountNo          입금할 계좌번호
   * @param transactionBalance 입금 금액
   * @param transactionSummary 거래 요약 설명
   * @return 프로젝트 내부 코드로 매핑된 입금 결과
   */
  public AccountDepositResponse processAccountDeposit(String accountNo, String transactionBalance,
      String transactionSummary) {
    try {
      // 1. API 요청 객체 생성
      AccountDepositRequest request = buildRequest(accountNo, transactionBalance, transactionSummary);

      log.info("계좌 입금 API 호출 시작 - 계좌번호: {}, 금액: {}",
          FinanceApiUtils.maskAccountNumber(accountNo), transactionBalance);

      // 2. 공통 API 유틸리티를 사용한 금융망 API 호출
      BaseApiResponse<AccountDepositResponse> responseBody = httpClientUtil.post(
          financeApiConfig.getAccounDepositUrl(),
          request,
          new ParameterizedTypeReference<BaseApiResponse<AccountDepositResponse>>() {
          },
          "펀딩계좌 입금");

      if (responseBody != null) {
        // 3. 응답 코드를 프로젝트 내부 코드로 매핑
        String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
        String apiMsg = responseBody.getHeader().getResponseMessage();
        PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

        // REC 데이터 추출 (실제 거래 정보)
        AccountDepositResponse result = responseBody.getRec();
        if (result == null) {
          log.warn("REC 데이터가 null입니다. 빈 응답 객체를 생성합니다.");
          result = new AccountDepositResponse();
        }

        // 4. 응답 객체에 프로젝트 내부 코드 설정
        result.setResponseCode(errorCode.getCode()); // PAY_XXXX
        result.setResponseMessage(errorCode.getMessage());

        // 5. 성공/실패에 따른 로깅
        if (errorCode.isSuccess()) {
          log.info("■■■■■■■■ 계좌 입금 성공 - 거래번호: {}, 거래일자: {}, 금액: {} ■■■■■■■■",
              result.getTransactionUniqueNo(),
              result.getTransactionDate(),
              transactionBalance);
        } else {
          log.warn("■■■■■■■■ 계좌 입금 실패 - 금융망API코드: {}, 금융망API메시지: {} 내부코드: {}, 메시지: {}, 계좌: {}, 금액: {}■■■■■■■■ ",
              apiCode,
              apiMsg,
              errorCode.getCode(),
              errorCode.getMessage(),
              FinanceApiUtils.maskAccountNumber(accountNo),
              transactionBalance);
        }

        return result;
      } else {
        log.error("응답 데이터가 null입니다.");
        return createErrorResponse("응답 데이터가 없습니다.");
      }

    } catch (RestClientException e) {
      // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
      log.error("계좌 입금 API 호출 실패: {}", e.getMessage(), e);
      return createErrorResponse(e.getMessage());
    }
  }

  /**
   * API 요청 객체 생성
   * 
   * 필수 헤더 정보와 계좌 입금 정보를 포함한 요청 객체를 구성
   * - Header: API 인증 및 메타데이터
   * - Body: 계좌 정보 및 입금 금액
   */
  private AccountDepositRequest buildRequest(String accountNo, String transactionBalance, String transactionSummary) {

    // 공통 헤더 생성
    ReqHeader header = FinanceApiUtils.buildCommonHeader(
        financeApiConfig,
        "updateDemandDepositAccountDeposit", true);

    // 전체 요청 객체 구성 (헤더 + 계좌 정보)
    return AccountDepositRequest.builder()
        .Header(header) // 인증 및 메타데이터
        .accountNo(accountNo) // 계좌번호
        .transactionBalance(transactionBalance) // 입금금액
        .transactionSummary(transactionSummary) // 거래요약
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
  private AccountDepositResponse createErrorResponse(String errorMessage) {
    AccountDepositResponse errorResponse = new AccountDepositResponse();

    // 모든 시스템 오류를 PAY_9999로 통일
    PaymentErrorCode systemError = PaymentErrorCode.SYSTEM_ERROR;
    errorResponse.setResponseCode(systemError.getCode()); // PAY_9999
    errorResponse.setResponseMessage(systemError.getMessage() + ": " + errorMessage);

    return errorResponse;
  }
}
