package io.ssafy.cinemoa.funding.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.BaseException;
import org.springframework.http.HttpStatus;

public class SeatLockException extends BaseException {
    public SeatLockException(String message) {
        super(message, HttpStatus.BAD_REQUEST, ResourceCode.SEAT);
    }

    public static SeatLockException ofAlreadyHolding() {
        return new SeatLockException("이미 좌석을 점유중입니다.");
    }

    public static SeatLockException ofNoRemainingSeat() {
        return new SeatLockException("남은 좌석이 없습니다.");
    }

    public static SeatLockException ofNotHolding() {
        return new SeatLockException("점유중인 좌석이 없습니다.");
    }
}
