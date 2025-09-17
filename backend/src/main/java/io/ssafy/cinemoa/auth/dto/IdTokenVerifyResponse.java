package io.ssafy.cinemoa.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdTokenVerifyResponse {
    private boolean success;       // 검증 성공 여부
    private IdTokenClaims claims;  // (성공 시) 클레임
    private String message;        // (실패 시) 에러 메시지
}
