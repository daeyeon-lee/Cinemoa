package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 계좌 유효성 검증 요청 DTO
 * - Header (ReqHeader)
 * - accountNo (계좌번호)
 */
@Data
@Builder
public class AccountVerifyRequest {
    @JsonProperty("Header")
    private ReqHeader Header; // 공통 요청 헤더

    private String accountNo; // 계좌번호
}
