package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.WonAuthStartRequest;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyRequest;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyResponse;
import io.ssafy.cinemoa.user.service.WonAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/wonauth")
@RequiredArgsConstructor
public class WonAuthController {

    private final WonAuthService wonAuthService;

    // 1원인증 시작 (글로벌 응답 포맷으로만 반환)
    @PostMapping("/start")
    public ResponseEntity<ApiResponse<?>> start(@RequestBody WonAuthStartRequest request) {
        wonAuthService.startWonAuth(request.getAccountNo(), request.getUserEmail());
        return ResponseEntity.ok(ApiResponse.ofSuccess(null, "1원 인증 시작 처리 완료"));
    }


    // 1원인증 검증
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<WonAuthVerifyResponse>> verify(@RequestBody WonAuthVerifyRequest request) {
        WonAuthVerifyResponse response = wonAuthService.verifyWonAuth(
                request.getAccountNo(),
                request.getAuthCode()
        );
        return ResponseEntity.ok(ApiResponse.ofSuccess(response, "1원 인증 검증 완료"));
    }

}
