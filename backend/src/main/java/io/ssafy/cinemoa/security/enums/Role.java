package io.ssafy.cinemoa.security.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum Role {
    USER("USER"), ANONYMOUS("ANONYMOUS");
    private final String role;
}
