package io.ssafy.cinemoa.global.exception;

import io.ssafy.cinemoa.global.enums.ResourceCode;
import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends BaseException {
    public ResourceNotFoundException(String message, ResourceCode resourceCode) {
        super(message, HttpStatus.NOT_FOUND, resourceCode);
    }

    public static ResourceNotFoundException ofUser() {
        return new ResourceNotFoundException("존재하지 않는 사용자입니다.", ResourceCode.USER);
    }

    public static ResourceNotFoundException ofCinema() {
        return new ResourceNotFoundException("존재하지 않는 영화관입니다.", ResourceCode.CINEMA);
    }

    public static ResourceNotFoundException ofScreen() {
        return new ResourceNotFoundException("존재하지 않는 상영관입니다.", ResourceCode.SCREEN);
    }

    public static ResourceNotFoundException ofFunding() {
        return new ResourceNotFoundException("존재하지 않는 펀딩입니다.", ResourceCode.FUNDING);
    }

    public static ResourceNotFoundException ofCard() {
        return new ResourceNotFoundException("등록된 카드가 없습니다.", ResourceCode.CARD);
    }

    public static ResourceNotFoundException ofLike() {
        return new ResourceNotFoundException("존재하지 않는 좋아요입니다.", ResourceCode.LIKE);
    }

    public static ResourceNotFoundException ofCategory() {
        return new ResourceNotFoundException("존재하지 않는 카테고리입니다.", ResourceCode.CATEGORY);
    }

    public static ResourceNotFoundException ofWonAuth(String message) {
        return new ResourceNotFoundException(message, ResourceCode.WONAUTH);
    }

    public static ResourceNotFoundException ofImage() {
        return new ResourceNotFoundException("존재하지 않는 이미지입니다.", ResourceCode.IMAGE);
    }
}
