package io.ssafy.cinemoa.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdTokenClaims {
    private String email;          // 이메일
    private String name;           // 전체 이름
    private String picture;        // 프로필 이미지 URL
}
