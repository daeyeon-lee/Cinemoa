package io.ssafy.cinemoa.auth.service;

import io.ssafy.cinemoa.auth.dto.GoogleAuthResponse;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;

import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;


@Slf4j
@Service // ← 비즈니스 로직 계층
@RequiredArgsConstructor // ← final 필드(userRepository) 생성자 주입
public class SocialAuthService {

    private final UserRepository userRepository;

    /**
     * 구글 디코딩 결과를 바탕으로 username(=이메일) 기준 로그인/중간가입 처리
     *
     * @param email        구글 이메일(=username으로 저장/조회)
     * @param name         구글 프로필 이름(없어도 됨 → nickname 기본값 대체)
     * @param pictureUrl   구글 프로필 사진 URL(없으면 기본값)
     * @param session      HttpSession (세션 로그인 목적)
     * @return             LoginDecisionResponse(userId, email, isAnonymous)
     */
    @Transactional // ← 읽기/쓰기 모두 발생
    public GoogleAuthResponse loginOrSignupByEmail(String email, String name, String pictureUrl, HttpSession session) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("이메일이 비어 있습니다.");
        }

        // 1) username(=이메일)로 기존 사용자 조회
        return userRepository.findByUsername(email)
                .map(existing -> {
                    // 기존 유저 → 세션 로그인
                    setLoginSession(session, existing.getId());
                    log.info("기존 사용자 로그인: id={}, username(email)={}", existing.getId(), existing.getUsername());
                    return new GoogleAuthResponse(existing.getId(), existing.getUsername(), false); // isAnonymous=false
                })
                .orElseGet(() -> {
                    // 2) 없으면 중간 회원가입(필수 NOT NULL 필드들 안전하게 채워넣기)
                    User toCreate = User.builder()
                            .username(email)                                // ← 이메일을 username에 저장
                            .password("{OAUTH_GOOGLE}" + UUID.randomUUID()) // ← 임시 패스워드(로그인에 사용 안 함)
                            .nickname(safeNickname(name, email))            // ← 이름 없으면 이메일 local-part 사용
                            .phoneNumber(null)                              // ← 선택값: 추후 추가정보 입력
                            .profileImgUrl(safeProfile(pictureUrl))         // ← 없으면 기본 이미지
                            .refundAccountNumber(null)                      // ← 선택값
                            .bankCode(null)                                 // ← 선택값
                            .isAdult(Boolean.FALSE)                         // ← 명시적으로 false
                            .build();

                    try {
                        User created = userRepository.save(toCreate);
                        setLoginSession(session, created.getId());
                        log.info("신규 사용자 생성(중간 회원가입) 및 로그인: id={}, username(email)={}", created.getId(), created.getUsername());
                        return new GoogleAuthResponse(created.getId(), created.getUsername(), true); // isAnonymous=true
                    } catch (DataIntegrityViolationException e) {
                        // 동시성 레이스: 거의 동시에 같은 이메일 가입 시도 → UNIQUE 충돌 복구
                        log.warn("username(email) UNIQUE 충돌 발생, 재조회 시도: {}", email);
                        User existing = userRepository.findByUsername(email).orElseThrow(() -> e);
                        setLoginSession(session, existing.getId());
                        return new GoogleAuthResponse(existing.getId(), existing.getUsername(), false);
                    }
                });
    }

    // 세션에 로그인 상태 기록(프로젝트 표준 키로 통일해서 사용 권장)
    private void setLoginSession(HttpSession session, Long userId) {
        session.setAttribute("LOGIN_USER_ID", userId); // ← 로그인 유저 식별자
        session.setAttribute("IS_AUTHENTICATED", true); // ← 인증 여부 플래그
    }

    // 이름이 비어있다면 이메일의 local-part( @ 앞 )로 닉네임 생성
    private String safeNickname(String name, String email) {
        String base = (name != null && !name.isBlank()) ? name : email.split("@")[0];
        // 엔티티 제약: nickname은 NOT NULL, varchar(50) → 과도하면 잘라줌
        return base.length() > 50 ? base.substring(0, 50) : base;
    }

    // 프로필 이미지가 없으면 기본 URL로 대체 (엔티티 NOT NULL)
    private String safeProfile(String pictureUrl) {
        String fallback = "https://cdn.cinemoa.io/profile/default.png"; // ← 서비스 기본 이미지 경로로 교체
        return (pictureUrl == null || pictureUrl.isBlank()) ? fallback : pictureUrl;
    }
}