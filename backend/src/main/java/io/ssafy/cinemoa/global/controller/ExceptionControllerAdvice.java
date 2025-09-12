package io.ssafy.cinemoa.global.controller;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.databind.JsonMappingException;
import io.ssafy.cinemoa.global.exception.BaseException;
import io.ssafy.cinemoa.global.exception.NoAuthorityException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@Slf4j
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


    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiResponse<?>> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                       HttpServletRequest request) {
        log.warn("JSON 파싱 실패!: {}", ex.getMessage());

        String message = "잘못된 요청 형식입니다.";

        Throwable cause = ex.getCause();
        if (cause instanceof JsonParseException) {
            message = "JSON 형식이 올바르지 않습니다.";
        } else if (cause instanceof JsonMappingException) {
            message = "요청 데이터 형식이 올바르지 않습니다.";
        }

        ApiResponse<?> errorResponse = ApiResponse.ofError(message);
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<?>> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        log.warn("Validation failed: {}", ex.getMessage());

        // 모든 검증 오류를 수집
        List<String> errorMessages = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage() + error.getCode())
                .collect(Collectors.toList());

        String message = "입력값 검증에 실패했습니다: " + String.join(", ", errorMessages);

        return ResponseEntity.badRequest().body(ApiResponse.ofError(message));
    }

    @ExceptionHandler(HandlerMethodValidationException.class)
    public ResponseEntity<ApiResponse<?>> handleHandlerMethodValidation(
            HandlerMethodValidationException ex, HttpServletRequest request) {

        log.warn("핸들러 검증 실패!!: {}", ex.getMessage());

        ApiResponse<?> errorResponse = ApiResponse.ofError("잘못된 필드가 포함되었습니다.");

        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<?>> handleMethodArgumentTypeMismatch(
            MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
        ApiResponse<?> errorResponse = ApiResponse.ofError("잘못된 필드가 포함되었습니다.");
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiResponse<?>> handleMissingServletRequestParameter(
            MissingServletRequestParameterException ex, HttpServletRequest request) {
        ApiResponse<?> errorResponse = ApiResponse.ofError("다음 필드가 누락되었습니다. : " + ex.getParameterName());

        return ResponseEntity.badRequest().body(errorResponse);
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<?>> handleUnexpectedException(Exception ex, HttpServletRequest request) {
        log.error("예상치 못한 예외가 발생하였습니다!! : {}", ex.getMessage(), ex);

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.ofError("서버 내 오류 발생!! 관리자에게 문의해 주세요."));
    }


}
