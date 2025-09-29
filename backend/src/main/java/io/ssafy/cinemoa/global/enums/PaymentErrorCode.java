package io.ssafy.cinemoa.global.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum PaymentErrorCode {
    // 성공
    SUCCESS("PAY_0000", "금융망 API 요청이 성공적으로 완료되었습니다"),

    // 카드 관련 (1000번대)
    INVALID_CARD_NUMBER("PAY_1001", "유효하지 않은 카드번호입니다"),
    INVALID_CVC("PAY_1002", "CVC 번호가 유효하지 않습니다"),
    // EXPIRED_CARD("PAY_1004", "만료된 카드입니다"),

    // // 거래 관련 (2000번대)
    // INVALID_AMOUNT("PAY_2001", "유효하지 않은 금액입니다"),
    // DUPLICATE_TRANSACTION("PAY_2002", "중복된 거래입니다"),
    // TRANSACTION_LIMIT_EXCEEDED("PAY_2003", "거래 한도를 초과했습니다"),
    // MERCHANT_ERROR("PAY_2004", "가맹점 정보 오류입니다"),
    
    
    // 계좌 관련 (3000번대)
    INVALID_ACCOUNT_ADDRESS("PAY_3001", "유효하지 않은 계좌번호입니다."),

    // 1원 인증 관련 (4000번대)
    AUTH_CODE_MISMATCH("PAY_4001", "인증코드가 일치하지 않습니다."),
    AUTH_CODE_TIMEOUT("PAY_4002", "인증 시간이 만료되었습니다."),
    INVALID_AUTH_CODE("PAY_4003", "인증코드가 유효하지 않습니다."),

    // 시스템 관련 (9000번대)
    NETWORK_ERROR("PAY_9001", "네트워크 오류가 발생했습니다"),
    API_TIMEOUT("PAY_9002", "API 응답 시간이 초과되었습니다"),
    EXTERNAL_API_ERROR("PAY_9003", "외부 결제 시스템 오류입니다"),
    SYSTEM_ERROR("PAY_9999", "시스템 오류가 발생했습니다"),

    // 기타
    UNKNOWN_ERROR("PAY_E999", "알 수 없는 오류가 발생했습니다");

    private final String code;
    private final String message;

    /**
     * 금융망 API 응답 코드를 프로젝트 내부 코드로 매핑
     */
    public static PaymentErrorCode fromApiCode(String ssafyCode) {
        if (ssafyCode == null) {
            return UNKNOWN_ERROR;
        }

        return switch (ssafyCode) {
            case "H0000" -> SUCCESS;
            case "A1054" -> INVALID_CARD_NUMBER;
            case "A1055" -> INVALID_CVC;
            case "A1003" -> INVALID_ACCOUNT_ADDRESS;
            case "A1088" -> AUTH_CODE_MISMATCH;
            case "A1087" -> AUTH_CODE_TIMEOUT;
            case "A1090" -> INVALID_AUTH_CODE;
            // case "H1002":
            // return INSUFFICIENT_BALANCE;
            // case "H1003":
            // return INVALID_CARD;
            // case "H1004":
            // return EXPIRED_CARD;
            // case "H2001":
            // return INVALID_AMOUNT;
            // case "H2002":
            // return DUPLICATE_TRANSACTION;
            // case "H2003":
            // return TRANSACTION_LIMIT_EXCEEDED;
            // case "H2004":
            // return MERCHANT_ERROR;
            case "H9001" -> NETWORK_ERROR;
            case "H9002" -> API_TIMEOUT;
            case "H9999" -> EXTERNAL_API_ERROR;
            default -> UNKNOWN_ERROR;
        };
    }

    public static PaymentErrorCode fromCode(String code) {
        for (PaymentErrorCode errorCode : values()) {
            if (errorCode.getCode().equals(code)) {
                return errorCode;
            }
        }
        return UNKNOWN_ERROR;
    }


    /**
     * 성공 여부 확인
     */
    public boolean isSuccess() {
        return this == SUCCESS;
    }
}
