package io.ssafy.cinemoa.security.helper;

import io.ssafy.cinemoa.security.entity.CustomUserDetails;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class SecurityContextHelper {

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

        if (principal instanceof CustomUserDetails) {
            CustomUserDetails userDetails = (CustomUserDetails) principal;
            return userDetails.getUserId();
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
