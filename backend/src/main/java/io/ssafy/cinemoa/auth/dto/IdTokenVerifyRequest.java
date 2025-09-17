package io.ssafy.cinemoa.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdTokenVerifyRequest {
    private String idToken; // 프론트에서 받은 Google ID 토큰(JWT)
}
