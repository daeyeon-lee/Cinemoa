package io.ssafy.cinemoa.global.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum ResourceCode {

    USER(1), CINEMA(2), SCREEN(3), FUNDING(4), CARD(5), ACCOUNT(6), QUERY(7), INPUT(8), LIKE(9), PAYMENT(10), REFUND(
            11),
    SEAT(12), CATEGORY(13), WONAUTH(14), TRANSFER(15), ERROR(127), IMAGE(16);

    private final int number;
}
