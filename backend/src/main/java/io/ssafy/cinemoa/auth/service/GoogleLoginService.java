package io.ssafy.cinemoa.auth.service;

import io.ssafy.cinemoa.auth.dto.GoogleAuthResponse;
import io.ssafy.cinemoa.user.repository.entity.User;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service // ← 스프링 서비스 빈 등록
@RequiredArgsConstructor // ← 생성자 주입
public class GoogleLoginService {

    /**
     * 기존 유저 로그인 처리
     *
     * @param user    이미 DB에 존재하는 User 엔티티
     * @param session HttpSession (세션 기반 로그인)
     * @return 로그인 응답 DTO (isAnonymous=false)
     */
    public GoogleAuthResponse login(User user, HttpSession session) {
        // 세션에 로그인 상태 기록
        session.setAttribute("LOGIN_USER_ID", user.getId());
        session.setAttribute("IS_AUTHENTICATED", true);

        // 응답 DTO 반환 (기존 유저이므로 isAnonymous=false)
        return new GoogleAuthResponse(user.getId(), user.getUsername(), false);
    }
}
