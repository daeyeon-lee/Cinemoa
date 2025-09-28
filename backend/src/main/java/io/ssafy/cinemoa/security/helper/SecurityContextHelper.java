package io.ssafy.cinemoa.security.helper;

import io.ssafy.cinemoa.security.entity.CustomUserDetails;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class SecurityContextHelper {
    
    private final UserRepository userRepository;

    /**
     * 현재 로그인한 사용자의 ID를 반환
     */
    public Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("인증되지 않은 사용자의 요청");
            throw new RuntimeException("인증되지 않은 사용자입니다.");
        }

        Object principal = authentication.getPrincipal();

        if (principal instanceof CustomUserDetails userDetails) {
            return userDetails.getUserId();
        } else if (principal instanceof String username) {
            // String(username)만 들어온 경우 DB에서 userId 조회
            User user = userRepository.findByUsername(username);
            if (user == null) {
                log.warn("사용자를 찾을 수 없습니다: {}", username);
                throw new RuntimeException("사용자 정보를 찾을 수 없습니다.");
            }
            return user.getId();
        }

        log.warn("올바르지 않은 Principal 타입: {}", principal.getClass().getName());
        throw new RuntimeException("사용자 정보를 가져올 수 없습니다.");
    }

    /**
     * 현재 로그인한 사용자의 상세 정보를 반환
     */
    // public CustomUserDetails getCurrentUserDetails() {
    //     Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    //
    //     if (authentication == null || !authentication.isAuthenticated()) {
    //         log.warn("인증되지 않은 사용자의 요청");
    //         throw new RuntimeException("인증되지 않은 사용자입니다.");
    //     }
    //
    //     Object principal = authentication.getPrincipal();
    //
    //     if (principal instanceof CustomUserDetails) {
    //         return (CustomUserDetails) principal;
    //     }
    //
    //     log.warn("올바르지 않은 Principal 타입: {}", principal.getClass().getName());
    //     throw new RuntimeException("사용자 정보를 가져올 수 없습니다.");
    // }

    /**
     * 현재 로그인한 사용자의 이메일을 반환
     */
    // public String getCurrentUserEmail() {
    //     return getCurrentUserDetails().getUsername();
    // }

}
