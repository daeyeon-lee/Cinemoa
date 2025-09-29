package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.external.finance.Client.AccountVerifyApiClient;
import io.ssafy.cinemoa.external.finance.Client.WonAuthApiClient;
import io.ssafy.cinemoa.external.finance.dto.AccountVerifyResponse;
import io.ssafy.cinemoa.external.finance.dto.TransactionHistoryResponse;
import io.ssafy.cinemoa.external.finance.dto.TransactionHistoryResponse.TransactionHistoryItem;
import io.ssafy.cinemoa.external.finance.dto.WonSendResponse;
import io.ssafy.cinemoa.external.finance.dto.WonVerifyResponse;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.redis.service.RedisService;
import io.ssafy.cinemoa.global.service.MailSenderService;
import io.ssafy.cinemoa.user.dto.WonAuthVerifyResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


/**
 * ✅ WonAuthService (회원가입 단계 전용)
 * <p>
 * 목적 - 입력으로 계좌번호만 받아서 다음 순서로 처리: 1) 계좌 유효성 검증 (AccountVerify) 2) 1원 송금 (WonSend) - 이후 사용자가 통장 입금내역/메모에서 확인한 인증코드로: 3)
 * 1원 인증 검증 (WonVerify)
 * <p>
 * 특징 - DB(User) 접근 없음 (회원가입 "이전" 단계이므로) - 외부 API 응답을 그대로 반환 (pass-through) - 네트워크/타임아웃 등 예외는 상위(@ControllerAdvice)에서 공통
 * 처리
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class WonAuthService {

    private static final String AUTH_TEXT = "CINEMOA";
    private static final ZoneId KST = ZoneId.of("Asia/Seoul");
    private static final DateTimeFormatter YMD = DateTimeFormatter.BASIC_ISO_DATE;
    // --------------------------------------------------------------------
    // Redis 키 형식 및 TTL
    // --------------------------------------------------------------------
    private static final String REDIS_KEY_PREFIX = "won_auth:";
    private static final Duration REDIS_TTL = Duration.ofMinutes(10); // 10분 유효
    // --------------------------------------------------------------------
    // 인증 코드 추출
    // --------------------------------------------------------------------
    // 인증코드 정규식: "CINEMOA 7814" → 7814
    private static final Pattern AUTH_CODE_PATTERN = Pattern.compile("CINEMOA\\s*(\\d{4})");
    // 외부 API 호출용 클라이언트들 (이미 프로젝트에 Bean으로 등록되어 있음)
    private final AccountVerifyApiClient accountVerifyApiClient; // 계좌 유효성 검증 전용
    private final WonAuthApiClient wonAuthApiClient;             // 1원 송금 + 1원 검증
    // --------------------------------------------------------------------
    // gmail 전송
    // --------------------------------------------------------------------
    private final MailSenderService senderService;
    // --------------------------------------------------------------------
    // Redis 서비스
    // --------------------------------------------------------------------
    private final RedisService redisService;

    // ============================ 내부 유틸 ========================================================

    // 시크릿키 생성 (UUID + 시간 + 계좌 → SHA-256 → hex 64자) ---
    private static String generateDeterministicSecret(String accountNo) throws Exception {
        // 엔트로피 소스: UUID 2개 + 계좌번호 + 현재시각
        String material =
                UUID.randomUUID() + ":" + accountNo + ":" + Instant.now().toEpochMilli() + ":" + UUID.randomUUID();
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

    /**
     * 값이 null이거나 공백이면 예외를 던지는 간단 검증 함수 - 서비스 레벨에서의 "기본 방어" 용도
     */
    private void must(String v, String msg) {
        if (v == null || v.isBlank()) {
            throw BadRequestException.ofInput(msg);
        }
    }

    // --------------------------------------------------------------------
    // 계좌검증 + 1원송금 + 인증코드 추출 + gmail 전송
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public void startWonAuth(String accountNo, String userEmail) {
        // 입력 검증: null/공백 방지
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");

        verifyAccount(accountNo);
        callWonSend(accountNo);

        String authCode = extractCode(accountNo);
        sendCodeMail(authCode, userEmail);
    }

    private void verifyAccount(String accountNo) {
        AccountVerifyResponse verifyResponse = accountVerifyApiClient.verifyAccount(accountNo);
        if (!PaymentErrorCode.fromCode(verifyResponse.getResponseCode()).isSuccess()) {
            throw BadRequestException.ofWonAuth("유효하지 않은 계좌번호입니다.");
        }
    }

    private void callWonSend(String accountNo) {
        WonSendResponse response = wonAuthApiClient.sendOneWon(accountNo, AUTH_TEXT);
        if (!PaymentErrorCode.fromCode(response.getResponseCode()).isSuccess()) {
            log.error("원화 1원인증 송금 호출 실패 : {}", response);
            throw InternalServerException.ofWonAuth();
        }
    }

    private String extractCode(String accountNo) {
        String today = LocalDate.now(KST).format(YMD); // "yyyyMMdd"
        return extractAuthCode(accountNo, today, today);
    }

    private void sendCodeMail(String authCode, String userEmail) {
        String subject = "[CINEMOA] 1원 인증 코드";      // 제목
        String body = "인증코드: " + authCode + "\n\n유효시간 내에 입력해주세요."; // 본문
        senderService.sendTextMail(userEmail, subject, body);
    }

    // --------------------------------------------------------------------
    // 1원 인증 검증
    // --------------------------------------------------------------------
    @Transactional(readOnly = true)
    public WonAuthVerifyResponse verifyWonAuth(String accountNo, String authCode) {
        // 입력 필수
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");
        must(authCode, "authCode(인증코드)는 필수입니다.");

        try {
            // 1. 외부 API 호출
            WonVerifyResponse res = wonAuthApiClient.checkAuthCode(accountNo, AUTH_TEXT, authCode);

            if (res == null) {
                throw InternalServerException.ofWonAuth();
            }

            String code = res.getResponseCode();    // 내부 표준코드: PAY_0000 / PAY_1088 …
            String msg = res.getResponseMessage(); // 내부 표준메시지

            return switch (code) {
                case "PAY_0000" -> {
                    // 성공
                    String secretKey = generateDeterministicSecret(accountNo);
                    // Redis에 해시값 저장 (회원가입 단계용)
                    saveHashForSignup(accountNo, secretKey);
                    yield WonAuthVerifyResponse.builder().secretKey(secretKey).build();
                }
                case "PAY_4001", "PAY_4002" -> throw BadRequestException.ofWonAuth(msg);
                case "PAY_4003" -> throw ResourceNotFoundException.ofWonAuth(msg);
                default -> throw InternalServerException.ofWonAuth();
            };
        } catch (Exception e) {
            log.error("1원 인증 처리 중 알 수 없는 오류", e);
            throw InternalServerException.ofWonAuth();
        }
    }

    private String extractAuthCode(String accountNo, String startDate, String endDate) {

        // 입력 필수
        must(accountNo, "accountNo(계좌번호)는 필수입니다.");
        must(startDate, "startDate(조회 시작일, YYYYMMDD)는 필수입니다.");
        must(endDate, "endDate(조회 종료일, YYYYMMDD)는 필수입니다.");

        try {
            // 1. 계좌 내역 조회 API 호출
            TransactionHistoryResponse res = wonAuthApiClient.inquireTransactionHistoryList(accountNo, startDate,
                    endDate, "M", "DESC");

            String code = res.getResponseCode();    // 내부 표준코드: PAY_0000 / PAY_1088 …
            String msg = res.getResponseMessage(); // 내부 표준메시지

            if (PaymentErrorCode.fromCode(code).equals(PaymentErrorCode.INVALID_ACCOUNT_ADDRESS)) {
                throw ResourceNotFoundException.ofWonAuth(msg);
            }

            if (!PaymentErrorCode.fromCode(code).isSuccess()) {
                throw InternalServerException.ofWonAuth();
            }

            // 2. 내림차순 리스트에서 '1원 입금' 첫 건 선택
            TransactionHistoryItem item = null;

            for (TransactionHistoryItem e : res.getList()) {
                if (e.getTransactionType().equals("1") && normalizeAmount(e.getTransactionBalance()).equals("1")) {
                    item = e;
                    break;
                }
            }

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
            String authCodeOnly = extractAuthCodeFromSummary(summary);
            if (authCodeOnly == null || authCodeOnly.isEmpty()) {
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
        if (s == null) {
            return "";
        }
        String digits = s.trim().replaceAll("[^0-9]", "");
        return digits.replaceFirst("^0+(?!$)", "");
    }

    // ============================ Redis 관련 메서드 ========================================================

    /**
     * Redis에서 1원 인증 해시값 검증
     * @param userId 사용자 ID (회원가입 후)
     * @param accountNo 계좌번호
     * @param providedHash 클라이언트에서 제공한 해시값
     * @return 검증 성공 여부
     */
    // public boolean verifyHashFromRedis(Long userId, String accountNo, String providedHash) {
    //     try {
    //         // 회원가입 후에는 userId를 사용하여 검증
    //         String redisKey = REDIS_KEY_PREFIX + userId + ":" + accountNo;
    //         String savedHash = redisService.getValue(redisKey);

    //         if (savedHash == null) {
    //             log.warn("Redis에서 해시값을 찾을 수 없음: key={}", redisKey);
    //             return false;
    //         }

    //         boolean isValid = savedHash.equals(providedHash);
    //         if (isValid) {
    //             log.info("1원 인증 해시값 검증 성공: userId={}, accountNo={}", userId, accountNo);
    //             // 검증 성공 시 Redis에서 해당 키 삭제 (일회성 사용)
    //             redisService.removeKey(redisKey);
    //         } else {
    //             log.warn("1원 인증 해시값 검증 실패: userId={}, accountNo={}", userId, accountNo);
    //         }

    //         return isValid;
    //     } catch (Exception e) {
    //         log.error("Redis 해시값 검증 중 오류 발생: userId={}, accountNo={}", userId, accountNo, e);
    //         return false;
    //     }
    // }

    /**
     * 회원가입 단계에서 1원 인증 해시값을 Redis에 저장 (userId 없이)
     *
     * @param accountNo 계좌번호
     * @param secretKey 해시값
     */
    public void saveHashForSignup(String accountNo, String secretKey) {
        try {
            String redisKey = REDIS_KEY_PREFIX + "signup:" + accountNo;
            redisService.setValue(redisKey, secretKey, REDIS_TTL);
            log.info("회원가입용 1원 인증 해시값 Redis 저장 완료: key={}, ttl={}분", redisKey, REDIS_TTL.toMinutes());
        } catch (Exception e) {
            log.error("Redis 해시값 저장 실패: accountNo={}", accountNo, e);
        }
    }

    /**
     * 회원가입 단계에서 1원 인증 해시값 검증 (userId 없이)
     *
     * @param accountNo    계좌번호
     * @param providedHash 클라이언트에서 제공한 해시값
     * @return 검증 성공 여부
     */
    public boolean verifyHashForSignup(String accountNo, String providedHash) {
        try {
            String redisKey = REDIS_KEY_PREFIX + "signup:" + accountNo;
            String savedHash = redisService.getValue(redisKey);

            if (savedHash == null) {
                log.warn("Redis에서 회원가입용 해시값을 찾을 수 없음: key={}", redisKey);
                return false;
            }

            log.info("저장되어 있는 해시값 : {}, 프론트에서 받은 해쉬값 : {}", savedHash, providedHash);
            boolean isValid = savedHash.equals(providedHash);
            if (isValid) {
                log.info("회원가입용 1원 인증 해시값 검증 성공: accountNo={}", accountNo);
                // 검증 성공 시 Redis에서 해당 키 삭제 (일회성 사용)
                redisService.removeKey(redisKey);
            } else {
                log.warn("회원가입용 1원 인증 해시값 검증 실패: accountNo={}", accountNo);
            }

            return isValid;
        } catch (Exception e) {
            log.error("회원가입용 Redis 해시값 검증 중 오류 발생: accountNo={}", accountNo, e);
            return false;
        }
    }

    // ============================ 공통 유틸 ========================================================

    // 인증코드 추출: "CINEMOA 7814" → Optional["7814"]
    private String extractAuthCodeFromSummary(String summary) {
        if (summary == null) {
            return null;
        }
        var m = AUTH_CODE_PATTERN.matcher(summary);
        if (m.find()) {
            return m.group(1);
        }
        return null;
    }
}
