package io.ssafy.cinemoa.global.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {

    private T data;

    @Builder.Default()
    private int code = 0;
    private String message;
    private ResponseState state;

    public static <T> ApiResponse<T> ofSuccess(T data, String message) {
        return ApiResponse.<T>builder()
                .state(ResponseState.SUCCESS)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> ofSuccess(T data) {
        return ApiResponse.<T>builder()
                .state(ResponseState.SUCCESS)
                .message("요청 성공")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> ofFail(String message, int code) {
        return ApiResponse.<T>builder()
                .state(ResponseState.FAIL)
                .code(code)
                .message(message)
                .build();
    }

    public static <T> ApiResponse<T> ofError(String message) {
        return ApiResponse.<T>builder()
                .state(ResponseState.ERROR)
                .message(message)
                .build();
    }
}
