package io.ssafy.cinemoa.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WonAuthVerifyResponse {
    private String secretKey; // 프론트 검증용 우리측 시크릿 키 (SUCCESS일 때만 발급)
}
