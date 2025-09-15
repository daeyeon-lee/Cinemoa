package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyRequest;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyResponse;
import io.ssafy.cinemoa.user.service.WonAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wonauth")
@RequiredArgsConstructor
public class WonAuthController {

    private final WonAuthService wonAuthService;

    // 1) 계좌 검증 + 1원 송금
    @PostMapping("/start")
    public BaseApiResponse<WonSendResponse> start(@RequestParam String accountNo) {
        return wonAuthService.startWonAuth(accountNo);
    }

    @PostMapping("/verify")
    public ApiResponse<WonAuthVerifyResponse> verify(@RequestBody WonAuthVerifyRequest request) {
        // 서비스에서 바로 ApiResponse<WonAuthVerifyResponse> 반환
        return wonAuthService.verifyWonAuth(
                request.getAccountNo(),
                request.getAuthCode()
        );
    }

}
