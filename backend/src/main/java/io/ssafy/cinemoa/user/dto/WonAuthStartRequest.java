package io.ssafy.cinemoa.user.dto;

import lombok.Data;

@Data // getter/setter, toString 등 자동 생성
public class WonAuthStartRequest {
    private String accountNo; // 계좌번호
    private String userEmail; // 사용자 email 주소
}
