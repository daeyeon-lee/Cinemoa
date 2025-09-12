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

    // 2) 1원 인증 검증
    @PostMapping("/verify")
    public ApiResponse<WonAuthVerifyResponse> verify(@RequestBody WonAuthVerifyRequest request) {
        // 서비스에서 인증 처리
        boolean isValid = wonAuthService.verifyWonAuth(
                request.getAccountNo(),
                request.getAuthCode()
        );

        // 응답 DTO 생성
        VerifyResponse response = VerifyResponse.builder()
                .accountNo(request.getAccountNo())
                .verified(isValid)
                .message(isValid ? "인증 성공" : "인증 실패")
                .build();

        // 글로벌 응답 래퍼로 감싸서 반환
        return ApiResponse.ofSuccess(response);
    }

}
