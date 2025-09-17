package io.ssafy.cinemoa.auth.service;

import io.ssafy.cinemoa.auth.dto.IdTokenClaims;
import io.ssafy.cinemoa.auth.dto.GoogleAuthResponse;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service // ← 스프링 서비스 빈 등록
@RequiredArgsConstructor // ← 생성자 주입
public class GoogleAuthFacadeService {

    private final GoogleIdTokenDecoderService decoderService; // id_token 디코더
    private final UserRepository userRepository;              // DB 조회용
    private final GoogleLoginService loginService;            // 로그인 처리
    private final GoogleSignupService signupService;          // 회원가입 처리

    /**
     * 구글 소셜 로그인 전체 플로우:
     *  1) id_token 디코딩
     *  2) email로 유저 조회
     *  3) 있으면 로그인 서비스 호출
     *  4) 없으면 회원가입 서비스 호출
     */
    @Transactional
    public GoogleAuthResponse handleGoogleLogin(String idToken, HttpSession session) {
        // 1) id_token → claims 디코딩
        IdTokenClaims claims = decoderService.verifyAndDecode(idToken);
        String email = claims.getEmail();

        // 2) DB 조회 후 분기
        return userRepository.findByUsername(email)
                .map(user -> {
                    log.info("기존 구글 유저 로그인: {}", email);
                    return loginService.login(user, session);
                })
                .orElseGet(() -> {
                    log.info("신규 구글 유저 회원가입: {}", email);
                    return signupService.signup(claims, session);
                });
    }
}
