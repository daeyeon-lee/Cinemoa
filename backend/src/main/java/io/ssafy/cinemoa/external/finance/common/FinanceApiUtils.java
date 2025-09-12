package io.ssafy.cinemoa.external.finance.common;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import io.ssafy.cinemoa.external.finance.config.FinanceApiConfig;
import io.ssafy.cinemoa.external.finance.dto.ReqHeader;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 금융망 API 공통 유틸리티
 *
 * 모든 금융망 API 클라이언트에서 공통으로 사용되는 기능들을 제공합니다.
 * - HTTP 헤더 생성
 * - 거래번호 생성
 * - 카드번호 마스킹
 * - 날짜/시간 포맷팅
 */
public class FinanceApiUtils {

    /**
     * HTTP 헤더 생성
     *
     * API 호출에 필요한 기본 HTTP 헤더를 설정합니다.
     *
     * @return 설정된 HTTP 헤더
     */
    public static HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON); // JSON 요청
        headers.set("Accept", MediaType.APPLICATION_JSON_VALUE); // JSON 응답 기대
        return headers;
    }

    /**
     * 고유 거래번호 생성
     *
     * 금융망 API에서 요구하는 기관거래고유번호를 생성합니다.
     * 형식: yyyyMMdd + HHmmssSSS + 3자리 난수 (총 20자리)
     * 예시: 20250910140605123456
     *
     * @return 20자리 고유 거래번호
     */
    public static String generateTransactionUniqueNo() {
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd")); // 날짜 8자리
        String time = now.format(DateTimeFormatter.ofPattern("HHmmssSSS")); // 시간 9자리

        // 일련번호 6자리 생성 (000 ~ 999)
        int serialNumber = (int) (Math.random() * 1000);
        String serialNumberStr = String.format("%03d", serialNumber);

        return date + time + serialNumberStr; // 20자리 고유번호
    }

    /**
     * 카드번호 마스킹
     *
     * 로그 출력 시 카드번호를 마스킹하여 보안을 강화합니다.
     * 형식: 1234-****-****-5678
     *
     * @param cardNo 원본 카드번호
     * @return 마스킹된 카드번호
     */
    public static String maskCardNumber(String cardNo) {
        if (cardNo == null || cardNo.length() < 4) {
            return "****";
        }
        return cardNo.substring(0, 4) + "-****-****-" + cardNo.substring(cardNo.length() - 4);
    }

    /**
     * 전송 날짜시간 포맷팅
     *
     * API 요청에 사용되는 날짜와 시간을 동시에 반환합니다.
     *
     * @return [날짜, 시간] 배열
     */
    public static String[] formatTransmissionDateTime() {
        LocalDateTime now = LocalDateTime.now();
        String date = now.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String time = now.format(DateTimeFormatter.ofPattern("HHmmss"));
        return new String[] { date, time };
    }

    /**
     * 금융망 API 공통 헤더 생성
     *
     * @param config  API 설정 객체
     * @param apiName API 서비스명
     * @return 구성된 ReqHeader 객체
     */
    public static ReqHeader buildCommonHeader(FinanceApiConfig config, String apiName) {
        String[] dateTime = formatTransmissionDateTime();

        return ReqHeader.builder()
                .apiName(apiName)
                .transmissionDate(dateTime[0]) // yyyyMMdd
                .transmissionTime(dateTime[1]) // HHmmss
                .institutionCode(config.getInstitutionCode())
                .fintechAppNo(config.getFintechAppNo())
                .apiServiceCode(apiName)
                .institutionTransactionUniqueNo(generateTransactionUniqueNo())
                .apiKey(config.getApiKey())
                .userKey(config.getUserKey())
                .build();
    }
}
