package io.ssafy.cinemoa.user.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 환불 계좌 상세 정보를 담는 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundAccountDto {
    private String accountNo;
    private String bankCode;
    private String bankName;
}
