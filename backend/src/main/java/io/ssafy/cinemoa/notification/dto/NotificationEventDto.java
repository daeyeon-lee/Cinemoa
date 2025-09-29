package io.ssafy.cinemoa.notification.dto;

import io.ssafy.cinemoa.notification.enums.NotificationEventType;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEventDto {
    private String eventId;
    private NotificationEventType eventType;
    private Long userId;
    private String message;
    private Object data;
    private LocalDateTime timestamp;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentSuccessData {
        private Long fundingId;
        private String fundingTitle;
        private Long amount;
    }

    private static String generateEventId() {
        return "event_" + System.currentTimeMillis() + "_" + (int) (Math.random() * 1000);
    }

    // 결제 성공 이벤트 생성 헬퍼 메서드
    public static NotificationEventDto createPaymentSuccessEvent(Long userId, Long fundingId,
                                                                 String fundingTitle, Long amount) {
        PaymentSuccessData paymentData = PaymentSuccessData.builder()
                .fundingId(fundingId)
                .fundingTitle(fundingTitle)
                .amount(amount)
                .build();

        return NotificationEventDto.builder()
                .eventId(generateEventId())
                .eventType(NotificationEventType.PAYMENT_SUCCESS)
                .userId(userId)
                .message(String.format("'%s' 펀딩에 %,d원이 결제 완료!", truncateTitle(fundingTitle, 15), amount))
                .data(paymentData)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 펀딩 성공 이벤트 생성 헬퍼 메서드
    public static NotificationEventDto createFundingSuccessEvent(Long userId, Long fundingId,
                                                                 String fundingTitle, Integer totalAmount,
                                                                 Integer participantCount) {
        FundingSuccessData fundingData = FundingSuccessData.builder()
                .fundingId(fundingId)
                .fundingTitle(fundingTitle)
                .totalAmount(totalAmount)
                .participantCount(participantCount)
                .build();

        return NotificationEventDto.builder()
                .eventId(generateEventId())
                .eventType(NotificationEventType.FUNDING_SUCCESS)
                .userId(userId)
                .message(String.format("'%s' 펀딩이 성공적으로 완료되었습니다!", truncateTitle(fundingTitle, 15)))
                .data(fundingData)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 펀딩 실패 이벤트 생성 헬퍼 메서드
    public static NotificationEventDto createFundingFailedEvent(Long userId, Long fundingId,
                                                                String fundingTitle, Integer refundAmount) {
        FundingInfodData fundingData = FundingInfodData.builder()
                .fundingId(fundingId)
                .fundingTitle(fundingTitle)
                .build();

        return NotificationEventDto.builder()
                .eventId(generateEventId())
                .eventType(NotificationEventType.FUNDING_FAILED_REFUNDED)
                .userId(userId)
                .message(String.format("'%s' 상영회 목표 달성 실패! 참여비 %,d원 환불 완료", truncateTitle(fundingTitle, 15),
                        refundAmount))
                .data(fundingData)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 펀딩 환불 이벤트 생성 헬퍼 메서드
    public static NotificationEventDto createFundingRefundEvent(Long userId, Long fundingId,
                                                                String fundingTitle, Integer refundAmount) {
        FundingInfodData fundingData = FundingInfodData.builder()
                .fundingId(fundingId)
                .fundingTitle(fundingTitle)
                .build();

        return NotificationEventDto.builder()
                .eventId(generateEventId())
                .eventType(NotificationEventType.FUNDING_REFUND)
                .userId(userId)
                .message(String.format("'%s' 상영회에 대한 참여비 %,d원 환불 완료", truncateTitle(fundingTitle, 15),
                        refundAmount))
                .data(fundingData)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 투표가 펀딩으로 전환 이벤트 생성 헬퍼 메서드
    public static NotificationEventDto createVoteToFundingEvent(Long userId, Long fundingId,
                                                                String fundingTitle) {
        FundingInfodData voteToFundingData = FundingInfodData.builder()
                .fundingId(fundingId)
                .fundingTitle(fundingTitle)
                .build();

        String truncatedTitle = truncateTitle(fundingTitle, 15);

        return NotificationEventDto.builder()
                .eventId(generateEventId())
                .eventType(NotificationEventType.VOTE_TO_FUNDING)
                .userId(userId)
                .message(String.format("'%s' 보고싶어요한 수요조사가 상영회로 열렸습니다!", truncatedTitle))
                .data(voteToFundingData)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FundingSuccessData {
        private Long fundingId;
        private String fundingTitle;
        private Integer totalAmount;
        private Integer participantCount;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FundingInfodData {
        private Long fundingId;
        private String fundingTitle;
    }

    // 펀딩 제목이 maxLength를 초과하면 축약 처리
    private static String truncateTitle(String fundingTitle, int maxLength) {
        if (fundingTitle == null || fundingTitle.isEmpty()) {
            return "";
        }

        if (fundingTitle.length() <= maxLength) {
            return fundingTitle;
        }

        String truncated = fundingTitle.substring(0, maxLength);
        int lastSpaceIndex = truncated.lastIndexOf(' ');

        // 공백이 있으면 단어 경계에서 자르기
        if (lastSpaceIndex > 0) {
            return truncated.substring(0, lastSpaceIndex) + "...";
        }

        return truncated + "...";
    }
}