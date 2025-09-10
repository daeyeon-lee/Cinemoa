package io.ssafy.cinemoa.external.finance.Client;

import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.CreditCardTransactionRequest;
import io.ssafy.cinemoa.external.finance.dto.CreditCardTransactionResponse;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;
import io.ssafy.cinemoa.external.finance.dto.ResHeader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Component
@RequiredArgsConstructor
public class CardApiClient {

    private final RestTemplate restTemplate;
    private final FinanceApiConfig financeApiConfig;

    /**
     * 카드 결제 트랜잭션 생성
     *
     * @param cardNo         카드 번호
     * @param cvc            CVC 번호
     * @param paymentBalance 결제 금액
     * @return 결제 결과
     */
    public BaseApiResponse<CreditCardTransactionResponse> createCreditCardTransaction(String cardNo, String cvc,
            String paymentBalance) {
        try {
            CreditCardTransactionRequest request = buildRequest(cardNo, cvc, paymentBalance);
            HttpHeaders headers = createHeaders();
            HttpEntity<CreditCardTransactionRequest> entity = new HttpEntity<>(request, headers);

            log.info("카드 결제 API 호출 시작 - 카드번호: {}, 금액: {}",
                    maskCardNumber(cardNo), paymentBalance);

            ResponseEntity<BaseApiResponse<CreditCardTransactionResponse>> response = restTemplate.exchange(
                    financeApiConfig.getCreditCardTransactionUrl(),
                    HttpMethod.POST,
                    entity,
                    new ParameterizedTypeReference<BaseApiResponse<CreditCardTransactionResponse>>() {
                    });

            BaseApiResponse<CreditCardTransactionResponse> responseBody = response.getBody();

            if (responseBody != null && "H0000".equals(responseBody.getHeader().getResponseCode())) {
                log.info("카드 결제 성공 - 거래번호: {}, 금액: {}",
                        responseBody.getREC().getTransactionUniqueNo(),
                        responseBody.getREC().getPaymentBalance());
            } else {
                log.warn("카드 결제 실패 - 응답코드: {}, 메시지: {}",
                        responseBody != null ? responseBody.getHeader().getResponseCode() : "NULL",
                        responseBody != null ? responseBody.getHeader().getResponseMessage() : "NULL");
            }

            return responseBody;

        } catch (RestClientException e) {
            log.error("카드 결제 API 호출 실패: {}", e.getMessage(), e);
            return createErrorResponse(e.getMessage());
        }
    }

    /**
     * API 요청 객체 생성
     */
    private CreditCardTransactionRequest buildRequest(String cardNo, String cvc, String paymentBalance) {
        LocalDateTime now = LocalDateTime.now();
        String transmissionDate = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String transmissionTime = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        String uniqueNo = generateTransactionUniqueNo();

        ReqHeader header = ReqHeader.builder()
                .apiName("createCreditCardTransaction")
                .transmissionDate(transmissionDate)
                .transmissionTime(transmissionTime)
                .institutionCode(financeApiConfig.getInstitutionCode())
                .fintechAppNo(financeApiConfig.getFintechAppNo())
                .apiServiceCode("createCreditCardTransaction")
                .institutionTransactionUniqueNo(uniqueNo)
                .apiKey(financeApiConfig.getApiKey())
                .userKey(financeApiConfig.getUserKey())
                .build();

        return CreditCardTransactionRequest.builder()
                .Header(header)
                .cardNo(cardNo)
                .cvc(cvc)
                .merchantId(financeApiConfig.getMerchantId())
                .paymentBalance(paymentBalance)
                .build();
    }

    /**
     * HTTP 헤더 생성
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE);
        return headers;
    }

    /**
     * 고유 거래번호 생성
     * 형식: yyyyMMdd + HHmmss + 일련번호6자리 (총 20자리)
     */
    private String generateTransactionUniqueNo() {
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String time = now.format(DateTimeFormatter.ofPattern("HHmmss"));

        // 일련번호 6자리 생성 (000000 ~ 999999)
        int serialNumber = (int) (Math.random() * 1000000);
        String serialNumberStr = String.format("%06d", serialNumber);

        return date + time + serialNumberStr;
    }

    /**
     * 카드번호 마스킹
     */
    private String maskCardNumber(String cardNo) {
        if (cardNo == null || cardNo.length() < 4) {
            return "****";
        }
        return cardNo.substring(0, 4) + "-****-****-" + cardNo.substring(cardNo.length() - 4);
    }

    /**
     * 오류 응답 생성
     */
    private BaseApiResponse<CreditCardTransactionResponse> createErrorResponse(String errorMessage) {
        BaseApiResponse<CreditCardTransactionResponse> errorResponse = new BaseApiResponse<>();

        ResHeader header = new ResHeader();
        header.setResponseCode("E9999");
        header.setResponseMessage("금융망 api 시스템 오류: " + errorMessage);

        errorResponse.setHeader(header);
        return errorResponse;
    }
}