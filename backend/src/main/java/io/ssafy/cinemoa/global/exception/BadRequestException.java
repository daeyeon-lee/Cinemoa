package io.ssafy.cinemoa.global.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class BadRequestException extends BaseException {
    public BadRequestException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.BAD_REQUEST, resourceCode);
    }

    public static BadRequestException ofQuery() {
        return new BadRequestException("잘못된 쿼리입니다.", ResourceCode.QUERY);
    }

    public static BadRequestException ofQuery(String message) {
        return new BadRequestException(message, ResourceCode.QUERY);
    }

    public static BadRequestException ofInput() {
        return new BadRequestException("잘못된 입력값입니다.", ResourceCode.INPUT);
    }

    public static BadRequestException ofAccount() {
        return new BadRequestException("유효하지 않은 통장입니다.", ResourceCode.ACCOUNT);
    }

    public static BadRequestException ofCard() {
        return new BadRequestException("유효하지 않은 카드입니다.", ResourceCode.CARD);
    }

    public static BadRequestException ofFunding(String message) {
        return new BadRequestException(message, ResourceCode.FUNDING);
    }

    public static BadRequestException ofWonAuth(String message) {
        return new BadRequestException(message, ResourceCode.WONAUTH);
    }
}
