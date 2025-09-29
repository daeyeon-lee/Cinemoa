package io.ssafy.cinemoa.security.service;

import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.security.dto.AnonymousUserInfo;
import io.ssafy.cinemoa.security.helper.GoogleOAuthHelper;
import io.ssafy.cinemoa.user.repository.entity.User;
import io.ssafy.cinemoa.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuthUserService {

    private final UserService userService;
    private final GoogleOAuthHelper googleOAuthHelper;

    public User loadUserWithToken(String vendor, String token) {

        AnonymousUserInfo userInfo;
        switch (vendor) {
            case "google" -> {
                userInfo = googleOAuthHelper.getOAuthInfoByIdToken(token);
            }
            default -> throw BadRequestException.ofInput("Wrong vendor");
        }
        return userService.getOrSave(userInfo);
    }
}
