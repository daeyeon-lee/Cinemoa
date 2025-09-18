package io.ssafy.cinemoa.security.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    USER("ROLE_USER"), ANONYMOUS("ROLE_ANONYMOUS");
    private final String role;
}
