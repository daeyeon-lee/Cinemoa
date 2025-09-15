package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.response.ApiResponse;
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

    // 계좌 검증 + 1원 송금
    @PostMapping("/start")
    public BaseApiResponse<WonSendResponse> start(@RequestParam String accountNo) {
        // 1) 계좌 검증 + 1원 송금 (원래 로직 그대로)
        BaseApiResponse<WonSendResponse> result = wonAuthService.startWonAuth(accountNo);

        // 2) 맨 마지막에 "인증코드 추출"까지 시도 (에러는 메인 응답에 영향 X)
        try {
            String today = LocalDate.now(ZoneId.of("Asia/Seoul"))
                    .format(DateTimeFormatter.BASIC_ISO_DATE); // "yyyyMMdd"
            wonAuthService.extractAuthCode(accountNo, today, today); // 당일 범위에서 추출 시도
        } catch (Exception e) {
            log.warn("[/start] 인증코드 추출 중 오류(메인 응답 영향 없음): {}", e.getMessage(), e);
        }

        return result; // ✅ 메인 응답은 그대로 반환
    }

    // 1원인증 검증
    @PostMapping("/verify")
    public ApiResponse<WonAuthVerifyResponse> verify(@RequestBody WonAuthVerifyRequest request) {
        // 서비스에서 바로 ApiResponse<WonAuthVerifyResponse> 반환
        return wonAuthService.verifyWonAuth(
                request.getAccountNo(),
                request.getAuthCode()
        );
    }

}
