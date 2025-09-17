package io.ssafy.cinemoa.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleAuthResponse {
    private Long userId;
    private String email;
    private boolean isAnonymous; // false=기존유저(바로 로그인), true=신규유저(추가정보 필요)
}
