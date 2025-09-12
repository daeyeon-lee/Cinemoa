package io.ssafy.cinemoa.user.dto;

import lombok.Data;

@Data // getter/setter, toString 등 자동 생성
public class WonAuthVerifyRequest {
    private String accountNo; // 계좌번호
    private String authCode;  // 인증 코드
}
