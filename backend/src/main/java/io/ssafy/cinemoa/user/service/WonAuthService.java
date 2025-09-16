package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.external.finance.Client.AccountVerifyApiClient;
import io.ssafy.cinemoa.external.finance.Client.WonAuthApiClient;
import io.ssafy.cinemoa.external.finance.dto.*;
import io.ssafy.cinemoa.funding.exception.SeatLockException;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.Drafttttttttt;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyResponse;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import jakarta.mail.MessagingException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpStatusCodeException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;


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

    private static final String AUTH_TEXT = "CINEMOA";
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YMD = DateTimeFormatter.BASIC_ISO_DATE;

    // --------------------------------------------------------------------
    // 계좌검증 + 1원송금 + 인증코드 추출 + gmail 전송
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public void startWonAuth(String accountNo, String userEmail) {
        // 입력 검증: null/공백 방지
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");

        // 1. 계좌 검증
        //     있으면 true, 없으면 false
        try {
            // 계좌검증 클라이언트 호출
            accountVerifyApiClient.verifyAccount(accountNo);
        } catch (HttpStatusCodeException e) {
            log.error("[AccountVerify 4xx/5xx] status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new Drafttttttttt("계좌 검증 중 오류가 발생했습니다.", e);
        }

        // 2. 1원 송금 (검증 성공시에만)
        try {
            wonAuthApiClient.sendOneWon(accountNo, AUTH_TEXT);
        } catch (HttpStatusCodeException e) {
            // 벤더 에러 원문 남기기 (중요!)
            log.error("원화 1원인증 송금 호출 실패 - status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new Drafttttttttt("벤더 송금 호출 중 오류가 발생했습니다.", e);
        }

        // 3. 인증코드 추출
        String authCode;
        try {
            String today = LocalDate.now(KST).format(YMD); // "yyyyMMdd"
            authCode = extractAuthCode(accountNo, today, today);
        } catch (HttpStatusCodeException e) {
            log.error("인증코드 추출 실패 - status:{} headers:{}\nbody:\n{}",
                    e.getStatusCode(), e.getResponseHeaders(), e.getResponseBodyAsString(), e);
            throw new Drafttttttttt("인증코드 추출 중 오류가 발생했습니다.", e);
        }

        // 4. Gmail 발송 (단순 텍스트)
        String subject = "[CINEMOA] 1원 인증 코드";      // 제목
        String body    = "인증코드: " + authCode + "\n\n유효시간 내에 입력해주세요."; // 본문
        try {
            // 필수 파라미터 공백 검사 (must 유틸 재사용)
            must(subject, "메일 제목(subject)은 필수입니다.");
            must(body, "메일 본문(body)은 필수입니다.");

            sendTextMail(userEmail, subject, body);
        } catch (MessagingException e) {
            // MessagingException import 이슈 피하려고 최상위로 묶어서 처리
            log.error("인증코드 메일 발송 실패", e);
            // 필요하면 사용자용 예외로 변환
            throw new Drafttttttttt("인증코드 메일 발송 중 오류가 발생했습니다.", e);
        }
    }


    // --------------------------------------------------------------------
    // 1원 인증 검증
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public ApiResponse<WonAuthVerifyResponse> verifyWonAuth(String accountNo, String authCode) {
        // 입력 필수
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");
        must(authCode,  "authCode(인증코드)는 필수입니다.");

        try {
            // 1. 외부 API 호출
            WonVerifyResponse res = wonAuthApiClient.checkAuthCode(accountNo, AUTH_TEXT, authCode);

            if (res == null) {
                return ApiResponse.ofError("외부 인증 응답이 없습니다.");
            }

            String code = res.getResponseCode();    // 내부 표준코드: PAY_0000 / PAY_1088 …
            String msg  = res.getResponseMessage(); // 내부 표준메시지

            // 2. 상태(REC.status) 확인 : ("SUCCESS"/"FAIL")
            if ("PAY_0000".equals(code)) {
                // 성공
                String secretKey = generateDeterministicSecret(accountNo);
                return ApiResponse.ofSuccess(
                        WonAuthVerifyResponse.builder().secretKey(secretKey).build(),
                        "1원 인증 검증이 완료되었습니다."
                );
            } else if ("PAY_4001".equals(code)) {
                // 인증코드 불일치
                throw BadRequestException.ofWonAuth(msg);
            } else if ("PAY_4002".equals(code)) {
                // 인증시간 만료
                throw BadRequestException.ofWonAuth(msg);
            } else if ("PAY_4003".equals(code)) {
                // 인증코드 유효하지않음
                throw ResourceNotFoundException.ofWonAuth(msg);
            } else {
                throw InternalServerException.ofWonAuth();
            }

        } catch (Exception e) {
            log.error("1원 인증 처리 중 알 수 없는 오류", e);
            throw InternalServerException.ofWonAuth();
        }
    }


    // ============================ 내부 유틸 ========================================================

    // --------------------------------------------------------------------
    // 인증 코드 추출
    // --------------------------------------------------------------------
    // 인증코드 정규식: "CINEMOA 7814" → 7814
    private static final Pattern AUTH_CODE_PATTERN =
            Pattern.compile("CINEMOA\\s*(\\d{4})");
    private String extractAuthCode(String accountNo, String startDate, String endDate) {

        // 입력 필수
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");
        must(startDate, "startDate(조회 시작일, YYYYMMDD)는 필수입니다.");
        must(endDate, "endDate(조회 종료일, YYYYMMDD)는 필수입니다.");

        try {
            // 1. 계좌 내역 조회 API 호출
            TransactionHistoryResponse res = wonAuthApiClient.inquireTransactionHistoryList(
                    accountNo, startDate, endDate, "M", "DESC");

            String code = res.getResponseCode();    // 내부 표준코드: PAY_0000 / PAY_1088 …
            String msg  = res.getResponseMessage(); // 내부 표준메시지

            if ("PAY_3001".equals(code)) {
                // 유효하지않은계좌
                throw ResourceNotFoundException.ofWonAuth(msg);
            } else if ("PAY_4001".equals(code)) {
                // 나머지 전부
                throw InternalServerException.ofWonAuth();
            }


//            if (rec == null || rec.getList() == null || rec.getList().isEmpty()) {
//                log.info("[TxnHistory] 해당 기간 거래내역 없음. accountNo={}, {}~{}", accountNo, startDate, endDate);
//                return Optional.empty();
//            }

            // 2. 내림차순 리스트에서 '1원 입금' 첫 건 선택
            var item = res.getList().stream()
                    .filter(i -> "1".equals(i.getTransactionType()))                    // 1=입금
                    .filter(i -> "1".equals(normalizeAmount(i.getTransactionBalance()))) // 금액 == "1"
                    .findFirst()
                    .orElse(null);

            if (item == null) {
                log.warn("1원 입금 내역 없음. accountNo={}, {}~{}", accountNo, startDate, endDate);
                throw ResourceNotFoundException.ofWonAuth("1원 입금 내역이 없습니다.");
            }

            // 3. 거래 요약 추출
            String summary = item.getTransactionSummary(); // 예: "CINEMOA 7814"
            if (summary == null || summary.isBlank()) {
                log.warn("거래 요약이 비어있습니다. item={}", item);
                throw ResourceNotFoundException.ofWonAuth("발급된 인증 코드가 없습니다.");
            }

            // 4. 인증코드 추출
            String authCodeOnly = extractAuthCodeFromSummary(summary).orElse("");
            if (authCodeOnly.isEmpty()) {
                log.warn("거래 요약에서 인증코드 추출 실패. summary='{}'", summary);
                throw ResourceNotFoundException.ofWonAuth("발급된 인증 코드가 없습니다.");
            }

            // 성공 시 인증코드 콘솔에 출력 (디버깅용)
            log.info("인증코드 추출 성공: summary='{}' authCode='{}'", summary, authCodeOnly);

            // ✅ 최종 반환
            return authCodeOnly;

        } catch (Exception e) {
            log.error("인증 코드 추출 중 알 수 없는 오류", e);
            throw InternalServerException.ofWonAuth();
        }
    }

    // 금액 정규화: 공백/콤마 제거 + 선행 0 제거 → "001"→"1", "1,000"→"1000"
    private String normalizeAmount(String s) {
        if (s == null) return "";
        String digits = s.trim().replaceAll("[^0-9]", "");
        return digits.replaceFirst("^0+(?!$)", "");
    }

    // 인증코드 추출: "CINEMOA 7814" → Optional["7814"]
    private Optional<String> extractAuthCodeFromSummary(String summary) {
        if (summary == null) return Optional.empty();
        var m = AUTH_CODE_PATTERN.matcher(summary);
        return m.find() ? Optional.of(m.group(1)) : Optional.empty();
    }

    // --------------------------------------------------------------------
    // gmail 전송
    // --------------------------------------------------------------------
    private final JavaMailSender mailSender;

    /**
     * 단순 텍스트 메일 전송
     * @param toEmail 수신자 이메일 주소
     * @param subject 메일 제목
     * @param body    메일 본문(텍스트)
     */
    public void sendTextMail(String toEmail, String subject, String body) throws MessagingException {
        // 1) 메일 객체 생성
        MimeMessage message = mailSender.createMimeMessage();

        // 2) Helper로 세부 설정 (false = 첨부 없음, "UTF-8" = 한글 지원)
        MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

        // 3) 발신자 / 수신자 / 제목 / 본문 설정
        helper.setFrom("${spring.mail.username}"); // Gmail 계정 (application.yml username과 동일)
        helper.setTo(toEmail);
        helper.setSubject(subject);
        helper.setText(body, false); // false = 일반 텍스트 모드

        // 4) 전송
        mailSender.send(message);
    }



    // ============================ 공통 유틸 ========================================================

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
