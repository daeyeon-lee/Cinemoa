package io.ssafy.cinemoa.global.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BaseException extends RuntimeException {

    private final int code;

    public BaseException(String message, HttpStatus httpStatus, ResourceCode resourceCode) {
        super(message);
        int tempCode;

        tempCode = httpStatus.value();
        if (resourceCode.getNumber() < 10) {
            tempCode *= 10;
            tempCode += resourceCode.getNumber();
        }

        code = tempCode;
    }

    @Override
    public synchronized Throwable fillInStackTrace() {
        return null;
    }
}
