package io.ssafy.cinemoa.user.dto;

import lombok.Data;              // @Data: getter/setter/toString 자동 생성
import lombok.Builder;           // @Builder: 빌더 패턴
import lombok.NoArgsConstructor; // @NoArgsConstructor: 파라미터 없는 생성자
import lombok.AllArgsConstructor;// @AllArgsConstructor: 모든 필드 생성자

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WonAuthCodeDto {
    // 인증코드가 포함된 거래 요약 (예: "CINEMOA 7814")
    private String transactionSummary;
}
