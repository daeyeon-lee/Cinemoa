package io.ssafy.cinemoa.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 환불계좌 변경 요청을 담는 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundAccountUpdateRequestDto {
    
    // 변경할 통장 계좌 번호
    @JsonProperty("accountNo")
    private String accountNo;
    
    // 은행코드
    @JsonProperty("bankCode")
    private String bankCode;
}
