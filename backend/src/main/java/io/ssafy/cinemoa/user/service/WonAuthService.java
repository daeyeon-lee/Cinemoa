package io.ssafy.cinemoa.user.service;

//import io.ssafy.cinemoa.global.exception.ResourceNotFoundException; // 리소스(유저 등) 없을 때 던지는 커스텀 예외
import io.ssafy.cinemoa.external.finance.Client.WonAuthApiClient;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;                 // JPA 엔티티(= DB 테이블과 매핑되는 클래스)
//import io.ssafy.cinemoa.user.wonauth.client.WonAuthApiClient; // 싸피 금융망 API만 모아둔 클라이언트
import lombok.RequiredArgsConstructor;                                // final 필드로 생성자 자동 생성(생성자 주입)
import org.springframework.stereotype.Service;                        // 서비스 빈 등록(비즈니스 로직 계층)
import org.springframework.transaction.annotation.Transactional;      // 트랜잭션 경계 설정

/**
 * ✅ WonAuthService (회원가입 단계 전용 버전)
 * - "1원 인증" 과정을 담당하는 서비스 클래스(회원가입 시점)
 * - 이 버전은 **DB(User)가 아직 없다는 전제**에서 동작합니다.
 *   → 그러므로 UserRepository 같은 DB 조회는 하지 않습니다.
 * - 클라이언트(프론트)로부터 받은 입력값(bankCode, accountNo)만 가지고
 *   외부 API(1원 송금, 검증 등)를 대신 호출해서 결과를 돌려줍니다.
 *
 * ⚠️ 확장 포인트(마이페이지 계좌 변경 2번 단계):
 *   - 나중에 "이미 존재하는 사용자"의 계좌를 바꾸며 1원 인증을 할 때는
 *     userId를 받아 DB에서 User를 조회하고, 검증 성공 시 DB에 반영하는 로직을
 *     별도 메서드로 추가하면 됩니다. (이 클래스에 메서드만 더 추가하면 OK)
 */
@Service
@RequiredArgsConstructor // final 필드(api)를 자동으로 생성자 주입해줌
public class WonAuthService {

    // 외부 1원 인증 API 호출을 대신해주는 클라이언트 (실제 은행/PG API 호출)
    private final WonAuthApiClient api;

    /**
     * 1단계: 1원 송금 시작(회원가입)
     * - 입력: bankCode(은행 코드), accountNo(계좌번호)
     * - 동작: 외부 API를 호출해서 해당 계좌로 1원을 보내고,
     *         외부가 발급해주는 txnId(거래ID)를 받아 클라이언트에게 돌려줍니다.
     * - 반환: 성공여부(success), txnId(검증 시 필요), message(설명)
     *
     * 핵심 포인트
     * - 이 시점에는 DB에 User가 없으므로, 계좌번호는 **클라이언트에서 받은 값**을 그대로 사용합니다.
     * - 예금주명(holderName)이 입력에 없다면 null로 넘겨도 됩니다(외부 API 스펙에 따라 필수/선택).
     */
    @Transactional(readOnly = true) // DB를 건드리지 않으므로 readOnly=true
    public StartResponse startForSignup(String bankCode, String accountNo) {
        // 1) 입력값 기본 검증(널/빈문자 체크)
        must(bankCode,  "bankCode는 필수입니다.");
        must(accountNo, "accountNo는 필수입니다.");

        // 2) 외부 1원 송금 API 호출
        //    - 예금주명이 사용자 입력에 없다면, holderName 자리에 null을 넘깁니다.
        //    - 실제 외부 문서에서 holderName이 필수라면 프론트에서 받아오도록 변경하세요.
        var res = api.sendOneWon(new WonAuthApiClient.SendOneWonReq(
                bankCode,
                accountNo,
                /* holderName */ null   // 입력에서 받지 않으므로 null 전달(외부 스펙에 맞게 조정)
        ));

        // 3) 외부 응답을 그대로 감싸서 반환
        //    - res.ok(): 외부 송금 요청 성공 여부
        //    - res.txnId(): 검증 단계에서 필요한 거래 ID
        //    - res.message(): 외부가 준 설명 메시지(실패 이유 등)
        return new StartResponse(res.ok(), res.txnId(), res.message());
    }

    /**
     * 2단계: 1원 인증 검증(회원가입)
     * - 입력: txnId(1단계에서 받은 거래ID), code(사용자가 통장 입금 내역에서 본 코드)
     * - 동작: 외부 "검증 API"에 txnId+code를 전달하여 일치 여부를 확인
     * - 반환: 성공여부(success), message(설명)
     *
     * 🎯 핵심 포인트
     * - 아직 DB에 User가 없으므로, 여기서도 DB 업데이트는 **전혀 하지 않습니다.**
     * - 검증 성공 시점에서 컨트롤러/상위 로직이 "회원생성"을 진행하면 됩니다.
     *   (예: 검증 완료 → 회원가입 최종 제출 → 그때 User 테이블에 insert)
     */
    @Transactional(readOnly = true)
    public VerifyResponse verifyForSignup(String txnId, String code) {
        // 1) 입력값 기본 검증
        must(txnId, "txnId는 필수입니다.");
        must(code,  "code는 필수입니다.");

        // 2) 외부 검증 API 호출 (txnId + code)
        var res = api.verifyOneWon(new WonAuthApiClient.VerifyOneWonReq(txnId, code));

        // 3) 외부 응답을 그대로 감싸서 반환
        return new VerifyResponse(res.verified(), res.message());
    }

    // === 컨트롤러 <-> 서비스 간 간단 응답 타입(레코드) ===
    // record: 간단한 데이터 상자 (자동으로 getter/toString 등 만들어줌)
    public record StartResponse(boolean success, String txnId, String message) {}
    public record VerifyResponse(boolean success, String message) {}

    // === 내부 유틸 메서드 ===

    // 값이 null이거나 빈 문자열이면 에러 던지고, 아니면 그대로 돌려주는 함수
    private static String must(String v, String msg) {
        if (v == null || v.isBlank()) throw new IllegalArgumentException(msg);
        return v;
    }
}