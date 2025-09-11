package io.ssafy.cinemoa.external.finance.dto;

import lombok.Builder;
import lombok.Data;

/**
 * 1원 인증 검증 응답 REC
 * WonAuthRequest
 */
@Data
@Builder
public class WonVerifyRequest {
    private ReqHeader Header;
    private String accountNo; // 계좌번호
    private String authText;  // 인증 문구 (예: "SSAFY")
    private String authCode;  // 사용자 확인 코드 (예: "8212")
}
