package io.ssafy.cinemoa.notification.service;

import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.notification.dto.NotificationEventDto;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.UserTransactionRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


@Slf4j
@Service
@RequiredArgsConstructor
public class FundingNotificationService {

    private final NotificationService notificationService;
    private final UserTransactionRepository userTransactionRepository;
    private final UserFavoriteRepository userFavoriteRepository;


    /**
     * 결제 성공 결과 알림 전송
     */
    @Async("sseTaskExecutor")
    public void notifyPaymentSuccess(Long userId, Funding funding, Long amount) {
        Long fundingId = funding.getFundingId();
        try {

            NotificationEventDto paymentSuccessEvent = NotificationEventDto.createPaymentSuccessEvent(
                    userId,
                    fundingId,
                    funding.getTitle(),
                    amount);
            notificationService.sendEventToUser(userId, paymentSuccessEvent);

            log.info("결제 성공 SSE 알림 전송 완료 - 사용자 ID: {}, 펀딩 ID: {}", userId, fundingId);

        } catch (Exception e) {
            log.error("결제 성공 SSE 알림 전송 실패 - 사용자 ID: {}, 펀딩 ID: {}, 오류: {}",
                    userId, fundingId, e.getMessage(), e);
            // SSE 알림 실패는 전체 트랜잭션에 영향을 주지 않도록 예외를 다시 던지지 않음
        }
    }


    /**
     * 성공한 펀딩 결과 알림 전송
     */
    @Async("sseTaskExecutor")
    public void notifyFundingSuccess(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();
            String fundingTitle = funding.getTitle();
            int participantCount = funding.getMaxPeople();
            int totalAmount = funding.getScreen().getPrice();

            // 펀딩 참여자들의 사용자 ID 조회
            List<Long> participantUserIds = userTransactionRepository
                    .findUserIdsByFunding_FundingIdAndState(fundingId, UserTransactionState.SUCCESS);

            if (participantUserIds.isEmpty()) {
                log.info("펀딩 참여자가 없어 알림을 보내지 않습니다 - 펀딩ID: {}", fundingId);
                return;
            }

            // 펀딩 참여자들에게 펀딩 성공 알림
            for (Long userId : participantUserIds) {
                NotificationEventDto successEvent = NotificationEventDto.createFundingSuccessEvent(
                        userId, fundingId, fundingTitle, totalAmount, participantCount);
                notificationService.sendEventToUser(userId, successEvent);
            }

            log.info("펀딩 성공 알림 전송 완료 - 펀딩ID: {}, 수신자 수: {}", fundingId, participantUserIds.size());

        } catch (Exception e) {
            log.error("펀딩 결과 알림 전송 중 오류 발생 - 펀딩ID: {}, 오류: {}",
                    funding.getFundingId(), e.getMessage(), e);
            // 알림 전송 실패는 전체 프로세스에 영향을 주지 않도록 예외를 다시 던지지 않음
        }
    }

    /**
     * 실패한 펀딩 환불 결과 알림 전송
     */
    @Async("sseTaskExecutor")
    public void notifyFailedFundingRefund(User user, Funding funding, Integer refundAmount) {
        try {
            Long userId = user.getId();
            Long fundingId = funding.getFundingId();
            String fundingTitle = funding.getTitle();
            int participantCount = funding.getMaxPeople();

            // 펀딩 실패 알림
            String failureReason = String.format("목표 인원 %d명 중 %d명만 참여하여 목표에 미달했습니다.",
                    funding.getMaxPeople(), participantCount);

            NotificationEventDto failedEvent = NotificationEventDto.createFundingFailedEvent(
                    userId, fundingId, fundingTitle, refundAmount);
            notificationService.sendEventToUser(userId, failedEvent);

            log.info("펀딩 실패 알림 전송 완료 - 펀딩ID: {}, 유저 아이디: {}, 환불 금액: {}", fundingId, userId, refundAmount);

        } catch (Exception e) {
            log.error("펀딩 결과 알림 전송 중 오류 발생 - 펀딩ID: {}, 오류: {}",
                    funding.getFundingId(), e.getMessage(), e);
            // 알림 전송 실패는 전체 프로세스에 영향을 주지 않도록 예외를 다시 던지지 않음
        }
    }

    /**
     * 투표→펀딩 전환 알림 전송
     */
    @Async("sseTaskExecutor")
    public void notifyVoteToFunding(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();
            String fundingTitle = funding.getTitle();

            // 해당 펀딩에 "보고싶어요"를 누른 사용자들 조회
            List<Long> userIds = userFavoriteRepository
                    .findUserIdsByFunding_FundingId(fundingId);

            if (userIds.isEmpty()) {
                return;
            }

            log.info("투표→펀딩 전환 알림 전송 시작 - 펀딩ID: {}, 관심사용자 수: {}",
                    fundingId, userIds.size());

            // 각 관심 사용자에게 알림 전송
            for (Long userId : userIds) {
                NotificationEventDto voteToFundingEvent = NotificationEventDto.createVoteToFundingEvent(
                        userId, fundingId, fundingTitle);
                notificationService.sendEventToUser(userId, voteToFundingEvent);
            }

            log.info("투표→펀딩 전환 알림 전송 완료 - 펀딩ID: {}, 수신자 수: {}",
                    fundingId, userIds.size());

        } catch (Exception e) {
            log.error("투표→펀딩 전환 알림 전송 중 오류 발생 - 펀딩ID: {}, 오류: {}",
                    funding.getFundingId(), e.getMessage(), e);
            // 알림 전송 실패는 전체 프로세스에 영향을 주지 않도록 예외를 다시 던지지 않음
        }
    }
}
