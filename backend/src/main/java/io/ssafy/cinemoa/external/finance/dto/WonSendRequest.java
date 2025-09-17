package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 1원 인증 요청 DTO
 */
@Data
@Builder
public class WonSendRequest {
    @JsonProperty("Header")
    private ReqHeader Header;

    private String accountNo;  // 계좌번호
    private String authText;   // 인증 문구 (예: "CINEMOA")
}
