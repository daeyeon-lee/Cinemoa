package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.external.finance.Client.AccountVerifyApiClient;
import io.ssafy.cinemoa.external.finance.Client.WonAuthApiClient;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.Drafttttttttt;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom; // 암호학적 난수 생성기  // 한국어 주석
import java.time.Instant;
import java.util.Base64;           // Base64 인코딩 유틸   // 한국어 주석
import java.util.UUID;


/**
 * ✅ WonAuthService (회원가입 단계 전용)
 *
 * 목적
 *  - 입력으로 계좌번호만 받아서 다음 순서로 처리:
 *    1) 계좌 유효성 검증 (AccountVerify)
 *    2) 1원 송금 (WonSend)
 *  - 이후 사용자가 통장 입금내역/메모에서 확인한 인증코드로:
 *    3) 1원 인증 검증 (WonVerify)
 *
 * 특징
 *  - DB(User) 접근 없음 (회원가입 "이전" 단계이므로)
 *  - 외부 API 응답을 그대로 반환 (pass-through)
 *  - 네트워크/타임아웃 등 예외는 상위(@ControllerAdvice)에서 공통 처리
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class WonAuthService {

    // 외부 API 호출용 클라이언트들 (이미 프로젝트에 Bean으로 등록되어 있음)
    private final AccountVerifyApiClient accountVerifyApiClient; // 계좌 유효성 검증 전용
    private final WonAuthApiClient wonAuthApiClient;             // 1원 송금 + 1원 검증

//    private static final String AUTH_CODE = "SSAFY";
    private static final String AUTH_TEXT = "CINEMOA";

    // --------------------------------------------------------------------
    // 계좌검증 → 1원송금
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public BaseApiResponse<WonSendResponse> startWonAuth(String accountNo) {
        // 입력 검증: null/공백 방지
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");

        // 계좌 유효성 검증 호출
        //     있으면 true, 없으면 false
        try {
            boolean verified = accountVerifyApiClient.verifyAccount(accountNo);
            if (!verified) throw BadRequestException.ofAccount();
            log.info("계좌가 있나요?: {}", verified);
        } catch (HttpStatusCodeException e) {
            log.error("[AccountVerify 4xx/5xx] status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new Drafttttttttt("계좌 검증 중 오류가 발생했습니다.", e);
        }

        // 검증 성공시에만 1원 송금
        try {
            return wonAuthApiClient.openAccountAuth(accountNo, AUTH_TEXT);
        } catch (HttpStatusCodeException e) {
            // 벤더 에러 원문 남기기 (중요!)
            log.error("원화 1원인증 송금 호출 실패 - status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new Drafttttttttt("벤더 송금 호출 중 오류가 발생했습니다.", e);
        }
    }


    // --------------------------------------------------------------------
    // 1원 인증 검증
    //      API 호출 → REC.status 확인 → SUCCESS면 secretKey 발급 → secretKey만 data로 반환
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public ApiResponse<WonAuthVerifyResponse> verifyWonAuth(String accountNo, String authCode) {
        // 입력 유효성 검사
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");
        must(authCode,  "authCode(인증코드)는 필수입니다.");

        try {
            // 외부 API 호출: BaseApiResponse<WonVerifyResponse> 형태로 수신
            BaseApiResponse<WonVerifyResponse> vendor =
                    wonAuthApiClient.checkAuthCode(accountNo, AUTH_TEXT, authCode);

            // 널 가드: body 또는 REC가 비어있으면 예외
            if (vendor == null || vendor.getREC() == null) {
                log.error("[WonAuthApiClient] 응답 본문이 비어있습니다. vendor={}", vendor);
                throw new IllegalStateException("1원 인증 응답이 비어있습니다.");
            }

            // (3) 상태 확인: REC.status ("SUCCESS"/"FAIL")
            String status = vendor.getREC().getStatus();
            if (!"SUCCESS".equalsIgnoreCase(status)) {
                log.warn("[WonAuthApiClient] 인증 실패 status={}", status);
                throw new IllegalArgumentException("인증 실패: 잘못된 인증 코드입니다.");
            }

            // (4) SUCCESS → 우리측 secretKey 생성(JDK17 호환 방식)
            String secretKey = generateDeterministicSecret(accountNo); // 아래 유틸 메서드 사용

            // (5) secretKey만 담아 성공 응답 반환
            return ApiResponse.ofSuccess(
                    WonAuthVerifyResponse.builder().secretKey(secretKey).build(),
                    "1원인증 검증 성공"
            );

        } catch (HttpStatusCodeException e) {
            log.error("[WonAuthApiClient 4xx/5xx] status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new IllegalStateException("1원 인증 검증 중 HTTP 오류가 발생했습니다.", e);

        } catch (Exception e) {
            log.error("[WonAuthApiClient ERROR] 외부 인증 처리 중 알 수 없는 오류", e);
            throw new RuntimeException("알 수 없는 오류가 발생했습니다.", e);
        }

    }


    // ============================ 공통 유틸 ============================

    /**
     * 값이 null이거나 공백이면 예외를 던지는 간단 검증 함수
     * - 서비스 레벨에서의 "기본 방어" 용도
     */
    private static String must(String v, String msg) {
        if (v == null || v.isBlank()) {
            throw new IllegalArgumentException(msg);
        }
        return v;
    }

    // 시크릿키 생성 (UUID + 시간 + 계좌 → SHA-256 → hex 64자) ---
    private static String generateDeterministicSecret(String accountNo) throws Exception {
        // 엔트로피 소스: UUID 2개 + 계좌번호 + 현재시각
        String material = UUID.randomUUID() + ":" + accountNo + ":" + Instant.now().toEpochMilli() + ":" + UUID.randomUUID();
        byte[] input = material.getBytes(StandardCharsets.UTF_8);

        MessageDigest md = MessageDigest.getInstance("SHA-256"); // JDK 표준
        byte[] hash = md.digest(input);

        // 바이트 → 소문자 hex (64자)
        StringBuilder sb = new StringBuilder(hash.length * 2);
        for (byte b : hash) {
            sb.append(Character.forDigit((b >>> 4) & 0xF, 16));
            sb.append(Character.forDigit(b & 0xF, 16));
        }
        return sb.toString(); // 예: "9f2a... (64자)"
    }
}
