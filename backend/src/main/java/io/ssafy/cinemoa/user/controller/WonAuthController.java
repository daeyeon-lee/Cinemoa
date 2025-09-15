package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.WonAuthStartRequest;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyRequest;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyResponse;
import io.ssafy.cinemoa.user.service.WonAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Slf4j
@RestController
@RequestMapping("/api/wonauth")
@RequiredArgsConstructor
public class WonAuthController {

    private final WonAuthService wonAuthService;

    // 1원인증 시작 (글로벌 응답 포맷으로만 반환)
    @PostMapping("/start")
    public ApiResponse<Void> start(@RequestBody WonAuthStartRequest request) {
        wonAuthService.startWonAuth(request.getAccountNo(), request.getUserEmail());
        return ApiResponse.ofSuccess(null, "1원 인증 시작 처리 완료");
    }


    // 1원인증 검증
    @PostMapping("/verify")
    public ApiResponse<WonAuthVerifyResponse> verify(@RequestBody WonAuthVerifyRequest request) {
        // 서비스에서 바로 ApiResponse<WonAuthVerifyResponse> 반환
        return wonAuthService.verifyWonAuth(
                request.getAccountNo(),
                request.getAuthCode()
        );
//        return ApiResponse.ofSuccess(null, "1원 인증 검증 완료");
    }

}
