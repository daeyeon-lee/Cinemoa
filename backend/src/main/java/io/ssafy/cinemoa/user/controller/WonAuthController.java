package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
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

    // 2) 1원 인증 검증
    @PostMapping("/verify")
    public BaseApiResponse<WonVerifyResponse> verify(
            @RequestParam String accountNo,
            @RequestParam String authCode) {
        return wonAuthService.verifyWonAuth(accountNo, authCode);
    }
}
