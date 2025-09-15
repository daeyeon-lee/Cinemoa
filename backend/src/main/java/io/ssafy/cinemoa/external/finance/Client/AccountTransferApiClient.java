package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.common.HttpClientUtil;
import io.ssafy.cinemoa.external.finance.common.FinanceApiUtils;
import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountTransferRequest;
import io.ssafy.cinemoa.external.finance.dto.AccountTransferResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
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
 * - 펀딩 계좌에서 영화관 계좌로 송금 처리
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AccountTransferApiClient {

  private final HttpClientUtil httpClientUtil;
  private final FinanceApiConfig financeApiConfig;

  /**
   * 계좌 이체 처리
   * 
   * 금융망 API를 호출하여 펀딩 계좌에서 영화관 계좌로 이체를 처리
   * 1. 요청 객체 생성 (헤더 + 계좌 정보)
   * 2. 외부 API 호출
   * 3. 프로젝트 내부 코드로 응답 코드 매핑
   * 4. 로깅 및 에러 처리
   *
   * @param fundingAccountNo     펀딩 계좌번호 (출금 계좌)
   * @param cinemaAccountNo      영화관 계좌번호 (입금 계좌)
   * @param transactionBalance   이체 금액
   * @param fundingId           펀딩 ID (로깅용)
   * @return 프로젝트 내부 코드로 매핑된 이체 결과
   */
  public AccountTransferResponse processAccountTransfer(String fundingAccountNo, String cinemaAccountNo,
      String transactionBalance, Long fundingId) {
    try {
      // 1. API 요청 객체 생성
      AccountTransferRequest request = buildRequest(fundingAccountNo, cinemaAccountNo, transactionBalance, fundingId);

      log.info("계좌 이체 API 호출 시작 - 펀딩계좌: {}, 영화관계좌: {}, 금액: {}, 펀딩ID: {}",
          FinanceApiUtils.maskAccountNumber(fundingAccountNo), 
          FinanceApiUtils.maskAccountNumber(cinemaAccountNo), 
          transactionBalance, fundingId);

      // 2. 공통 API 유틸리티를 사용한 금융망 API 호출
      BaseApiResponse<List<AccountTransferResponse>> responseBody = httpClientUtil.post(
          financeApiConfig.getAccountTransferUrl(),
          request,
          new ParameterizedTypeReference<BaseApiResponse<List<AccountTransferResponse>>>() {
          },
          "펀딩계좌→영화관계좌 이체");

      if (responseBody != null) {
        // 3. 응답 코드를 프로젝트 내부 코드로 매핑
        String apiCode = responseBody.getHeader().getResponseCode(); // "H0000"
        String apiMsg = responseBody.getHeader().getResponseMessage();
        PaymentErrorCode errorCode = PaymentErrorCode.fromApiCode(apiCode); // "PAY_0000"

        // REC 데이터 추출 (실제 거래 정보 - 리스트 형태)
        List<AccountTransferResponse> recList = responseBody.getREC();
        AccountTransferResponse result = new AccountTransferResponse();
        
        if (recList != null && !recList.isEmpty()) {
          // 첫 번째 거래 정보를 사용 (출금 거래)
          result = recList.get(0);
        } else {
          log.warn("REC 데이터가 null이거나 비어있습니다. 빈 응답 객체를 생성합니다.");
        }

        // 4. 응답 객체에 프로젝트 내부 코드 설정
        result.setResponseCode(errorCode.getCode()); // PAY_XXXX
        result.setResponseMessage(errorCode.getMessage());

        // 5. 성공/실패에 따른 로깅
        if (errorCode.isSuccess()) {
          log.info("■■■■■■■■계좌 이체 성공 - 거래번호: {}, 거래일자: {}, 금액: {}, 펀딩ID: {}, 내부코드: {}■■■■■■■■",
              result.getTransactionUniqueNo(),
              result.getTransactionDate(),
              transactionBalance,
              fundingId,
              errorCode.getCode());
        } else {
          log.warn("■■■■■■■■계좌 이체 실패 - 금융망API코드: {}, 금융망API메시지: {} 내부코드: {}, 메시지: {}, 펀딩계좌: {}, 영화관계좌: {}, 금액: {}, 펀딩ID: {}■■■■■■■■",
              apiCode,
              apiMsg,
              errorCode.getCode(),
              errorCode.getMessage(),
              FinanceApiUtils.maskAccountNumber(fundingAccountNo),
              FinanceApiUtils.maskAccountNumber(cinemaAccountNo),
              transactionBalance,
              fundingId);
        }

        return result;
      } else {
        log.error("응답 데이터가 null입니다.");
        return createErrorResponse("응답 데이터가 없습니다.");
      }

    } catch (RestClientException e) {
      // 네트워크 오류, 타임아웃 등 API 호출 자체가 실패한 경우
      log.error("계좌 이체 API 호출 실패: {}", e.getMessage(), e);
      return createErrorResponse(e.getMessage());
    }
  }

  /**
   * API 요청 객체 생성
   * 
   * 필수 헤더 정보와 계좌 이체 정보를 포함한 요청 객체를 구성
   * - Header: API 인증 및 메타데이터
   * - Body: 계좌 정보 및 이체 금액
   */
  private AccountTransferRequest buildRequest(String fundingAccountNo, String cinemaAccountNo, 
      String transactionBalance, Long fundingId) {

    // 공통 헤더 생성
    ReqHeader header = FinanceApiUtils.buildCommonHeader(
        financeApiConfig,
        "updateDemandDepositAccountTransfer", true);

    // 전체 요청 객체 구성 (헤더 + 계좌 정보)
    return AccountTransferRequest.builder()
        .Header(header) // 인증 및 메타데이터
        .depositAccountNo(cinemaAccountNo) // 입금받을 계좌번호 (영화관 계좌)
        .depositTransactionSummary("(수시입출금) : 입금(이체)") // 입금 거래 요약
        .transactionBalance(transactionBalance) // 이체금액
        .withdrawalAccountNo(fundingAccountNo) // 출금할 계좌번호 (펀딩 계좌)
        .withdrawalTransactionSummary("(수시입출금) : 출금(이체)") // 출금 거래 요약
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
