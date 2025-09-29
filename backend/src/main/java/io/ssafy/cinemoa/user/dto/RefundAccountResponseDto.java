package io.ssafy.cinemoa.user.dto;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.annotation.JsonInclude;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
// null인 필드는 응답에 포함하지 않도록 설정
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RefundAccountResponseDto {
    private Long userId;
    private RefundAccountDto refundAccount;
    // 등록된 환불 계좌가 없을 경우의 안내 메시지
    // 예. 환불계좌를 등록해주세요.
    private String message;
}
