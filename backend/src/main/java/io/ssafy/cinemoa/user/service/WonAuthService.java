package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.external.finance.Client.AccountVerifyApiClient;
import io.ssafy.cinemoa.external.finance.Client.WonAuthApiClient;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyResponse;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.Drafttttttttt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;

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

    /**
     * 고정 인증 문구(벤더 스펙에 맞춰 사용)
     * - 지금은 "SSAFY" 상수로 사용
     * - 나중에 운영환경/설정파일로 분리 가능
     */
    private static final String AUTH_CODE = "SSAFY";
    private static final String AUTH_TEXT = "CINEMOA";

    // --------------------------------------------------------------------
    // 1) 회원가입 단계에서: 계좌번호만 받아 "계좌검증 → 1원송금" 까지 수행
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public BaseApiResponse<WonSendResponse> startWonAuth(String accountNo) {
        // (1) 입력 검증: null/공백 방지
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");

        // (2) 계좌 유효성 검증 호출
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
            return wonAuthApiClient.openAccountAuth(accountNo, AUTH_CODE);
        } catch (HttpStatusCodeException e) {
            // 벤더 에러 원문 남기기 (중요!)
            log.error("원화 1원인증 송금 호출 실패 - status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new Drafttttttttt("벤더 송금 호출 중 오류가 발생했습니다.", e);
        }
    }


    // --------------------------------------------------------------------
    // 2) 사용자에게서 인증코드를 받은 뒤: "1원 인증 검증" 수행
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public BaseApiResponse<WonVerifyResponse> verifyWonAuth(String accountNo, String authCode) {
        // (1) 입력 검증
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");
        must(authCode,  "authCode(인증코드)는 필수입니다.");

        // (2) 1원 인증 검증 호출 (accountNo + auth + AUTH_CODE)
        return wonAuthApiClient.checkAuthCode(accountNo, AUTH_TEXT, AUTH_CODE);
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
}
