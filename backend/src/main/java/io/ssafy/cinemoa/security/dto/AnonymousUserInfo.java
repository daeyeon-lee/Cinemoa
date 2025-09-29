package io.ssafy.cinemoa.security.dto;

import io.ssafy.cinemoa.security.enums.Role;
import io.ssafy.cinemoa.user.repository.entity.User;
import io.ssafy.cinemoa.user.service.MovieNicknameGenerator;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AnonymousUserInfo {

    private String email;
    private String picture;

    public User toUser() {
        // 랜덤 닉네임 생성
        MovieNicknameGenerator nicknameGenerator = new MovieNicknameGenerator();
        String randomNickname = nicknameGenerator.generate();
        
        return User.builder()
                .username(email)
                .profileImgUrl(picture)
                .nickname(randomNickname)
                .password("socialUser")
                .isAdult(true)
                .role(Role.ANONYMOUS)
                .build();
    }
}
