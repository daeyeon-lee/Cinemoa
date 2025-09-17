package io.ssafy.cinemoa.auth.service;

import io.ssafy.cinemoa.auth.dto.IdTokenClaims;
import io.ssafy.cinemoa.auth.dto.GoogleAuthResponse;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.servlet.http.HttpSession;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service // ← 스프링 서비스 빈 등록
@RequiredArgsConstructor // ← 생성자 주입
public class GoogleSignupService {

    private final UserRepository userRepository;

    /**
     * 신규 유저 회원가입 처리 (구글 클레임 기반)
     *
     * @param claims  구글 id_token에서 추출된 클레임 (email, name, picture)
     * @param session HttpSession (세션 기반 로그인)
     * @return 회원가입 후 로그인 응답 DTO (isAnonymous=true)
     */
    @Transactional
    public GoogleAuthResponse signup(IdTokenClaims claims, HttpSession session) {
        User newUser = userRepository.save(
                User.builder()
                        .username(claims.getEmail())                     // username=이메일
                        .password("{OAUTH_GOOGLE}" + UUID.randomUUID()) // 임시 비번
                        .nickname(makeNickname(claims.getName(), claims.getEmail()))
                        .phoneNumber(null)
                        .profileImgUrl(defaultProfile(claims.getPicture()))
                        .refundAccountNumber(null)
                        .bankCode(null)
                        .isAdult(Boolean.FALSE)
                        .build()
        );

        // 세션에 로그인 상태 기록
        session.setAttribute("LOGIN_USER_ID", newUser.getId());
        session.setAttribute("IS_AUTHENTICATED", true);

        // 응답 DTO 반환 (신규 유저이므로 isAnonymous=true)
        return new GoogleAuthResponse(newUser.getId(), newUser.getUsername(), true);
    }

    // 닉네임 안전 처리
    private String makeNickname(String name, String email) {
        String base = (name != null && !name.isBlank()) ? name : email.split("@")[0];
        return base.length() > 50 ? base.substring(0, 50) : base;
    }

    // 프로필 이미지 기본값 처리
    private String defaultProfile(String picture) {
        return (picture == null || picture.isBlank())
                ? "https://cdn.cinemoa.io/profile/default.png"
                : picture;
    }
}
