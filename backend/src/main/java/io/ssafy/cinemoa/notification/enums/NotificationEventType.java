package io.ssafy.cinemoa.notification.enums;

public enum NotificationEventType {
    PAYMENT_SUCCESS("결제 성공"),
    FUNDING_SUCCESS("펀딩 완료"),
    FUNDING_FAILED_REFUNDED("펀딩 실패 및 환불 완료"),
    VOTE_TO_FUNDING("보고싶어요한 투표가 상영회로 열림");


    private final String description;

    NotificationEventType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
