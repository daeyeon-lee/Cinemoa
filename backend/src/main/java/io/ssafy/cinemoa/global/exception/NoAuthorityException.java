package io.ssafy.cinemoa.global.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class NoAuthorityException extends BaseException {
    public NoAuthorityException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.FORBIDDEN, resourceCode);
    }

    public static NoAuthorityException ofUser() {
        return new NoAuthorityException("해당 사용자에 접근할 권한이 없습니다.", ResourceCode.USER);
    }

    public static NoAuthorityException ofFunding() {
        return new NoAuthorityException("해당 펀딩에 접근할 권한이 없습니다.", ResourceCode.FUNDING);
    }
}
