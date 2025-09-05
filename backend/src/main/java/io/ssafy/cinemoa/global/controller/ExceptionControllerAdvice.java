package io.ssafy.cinemoa.global.controller;

import io.ssafy.cinemoa.global.exception.BaseException;
import io.ssafy.cinemoa.global.exception.NoAuthorityException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ExceptionControllerAdvice {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ApiResponse<?>> baseExceptionHandler(BaseException e) {
        ApiResponse<Object> body = ApiResponse.ofFail(e.getMessage(), e.getCode());

        if (e instanceof ResourceNotFoundException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(body);
        }

        if (e instanceof NoAuthorityException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(body);
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }
}
