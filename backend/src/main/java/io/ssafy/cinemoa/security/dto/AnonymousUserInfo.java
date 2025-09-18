package io.ssafy.cinemoa.security.dto;

import io.ssafy.cinemoa.security.enums.Role;
import io.ssafy.cinemoa.user.repository.entity.User;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnonymousUserInfo {

    private String email;
    private String picture;

    public User toUser() {
        return User.builder()
                .username(email)
                .profileImgUrl(picture)
                .nickname("")
                .password("socialUser")
                .isAdult(true)
                .role(Role.ANONYMOUS)
                .build();
    }
}
