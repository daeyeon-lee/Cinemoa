package io.ssafy.cinemoa.favorite.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.BaseException;
import org.springframework.http.HttpStatus;

public class FavoriteException extends BaseException {
    public FavoriteException(String message) {
        super(message, HttpStatus.BAD_REQUEST, ResourceCode.LIKE);
    }

    public static FavoriteException ofLikeExists() {
        return new FavoriteException("이미 존재하는 보고싶어요입니다.");
    }

    public static FavoriteException ofLikeDoesntExists() {
        return new FavoriteException("존재하지않는 보고싶어요입니다.");
    }
}
