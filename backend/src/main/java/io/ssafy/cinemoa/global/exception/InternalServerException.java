package io.ssafy.cinemoa.global.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class InternalServerException extends BaseException {
    public InternalServerException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.INTERNAL_SERVER_ERROR, resourceCode);
    }

    public static InternalServerException ofPayment() {
        return new InternalServerException("결제 처리중 오류가 발생하였습니다.", ResourceCode.PAYMENT);
    }

    public static InternalServerException ofRefund() {
        return new InternalServerException("환불 처리중 오류가 발생하였습니다.", ResourceCode.REFUND);
    }

    public static InternalServerException ofUnknown() {
        return new InternalServerException("알 수 없는 오류가 발생하였습니다.", ResourceCode.ERROR);
    }

    public static InternalServerException ofWonAuth() {
        return new InternalServerException("1원 인증 중 오류가 발생했습니다.", ResourceCode.WONAUTH);
    }

    public static InternalServerException ofTransfer() {
        return new InternalServerException("송금 처리중 오류가 발생하였습니다.", ResourceCode.PAYMENT);
    }
}
