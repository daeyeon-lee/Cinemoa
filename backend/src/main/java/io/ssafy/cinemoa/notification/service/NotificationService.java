package io.ssafy.cinemoa.notification.service;

import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.notification.dto.NotificationEventDto;
import io.ssafy.cinemoa.payment.repository.FundingTransactionRepository;
import io.ssafy.cinemoa.payment.repository.UserTransactionRepository;
import io.ssafy.cinemoa.payment.repository.entity.FundingTransaction;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Slf4j
@RequiredArgsConstructor
public class NotificationService {

    private final UserTransactionRepository userTransactionRepository;
    private final FundingTransactionRepository fundingTransactionRepository;

    // 사용자별 SSE 연결 관리 (사용자 ID -> SseEmitter)
    private final ConcurrentMap<Long, SseEmitter> userConnections = new ConcurrentHashMap<>();

    // SSE 연결 타임아웃 (6시간)
    private static final long TIMEOUT = 6 * 60 * 60 * 1000L;

    /**
     * 새로운 SSE 연결 생성
     */
    public SseEmitter createConnection(Long userId) {
        log.info("SSE 연결 생성 - 사용자 ID: {}", userId);

        // 기존 연결이 있다면 종료
        SseEmitter existingEmitter = userConnections.get(userId);
        if (existingEmitter != null) {
            try {
                existingEmitter.complete();
            } catch (Exception e) {
                log.warn("기존 SSE 연결 종료 중 오류 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
            }
        }

        // 새 연결 생성
        SseEmitter emitter = new SseEmitter(TIMEOUT);
        userConnections.put(userId, emitter);

        // 연결 완료 시 정리
        emitter.onCompletion(() -> {
            log.info("SSE 연결 완료 - 사용자 ID: {}", userId);
            userConnections.remove(userId);
        });

        // 연결 타임아웃 시 정리
        emitter.onTimeout(() -> {
            log.info("SSE 연결 타임아웃 - 사용자 ID: {}", userId);
            userConnections.remove(userId);
            try {
                emitter.complete();
            } catch (Exception e) {
                log.warn("SSE 연결 타임아웃 처리 중 오류 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
            }
        });

        // 연결 에러 시 정리
        emitter.onError((throwable) -> {
            log.error("SSE 연결 에러 - 사용자 ID: {}, 오류: {}", userId, throwable.getMessage());
            userConnections.remove(userId);
            try {
                emitter.complete();
            } catch (Exception e) {
                log.warn("SSE 연결 에러 처리 중 오류 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
            }
        });

        // 연결 확인 메시지 전송
        try {
            emitter.send(SseEmitter.event()
                    .id("connection_" + System.currentTimeMillis())
                    .name("connected")
                    .data("SSE 연결이 성공했습니다."));
        } catch (IOException e) {
            log.error("SSE 연결 확인 메시지 전송 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
            userConnections.remove(userId);
            emitter.completeWithError(e);
        }

        // 초기 데이터 전송 (과거 알림 이력 목록)
        sendInitialData(emitter, userId);

        return emitter;
    }

    /**
     * 초기 데이터 전송 (과거 알림 이력 목록)
     */
    private void sendInitialData(SseEmitter emitter, Long userId) {
        try {
            log.info("초기 데이터 전송 - 사용자 ID: {}", userId);

            List<NotificationEventDto> initialNotifications = new ArrayList<>();

            // 1. 결제 성공 알림 (UserTransaction SUCCESS)
            List<UserTransaction> successTransactions = userTransactionRepository
                    .findSuccessTransactionsByUserId(userId);

            for (UserTransaction transaction : successTransactions) {
                NotificationEventDto eventDto = NotificationEventDto.createPaymentSuccessEvent(
                        userId,
                        transaction.getFunding().getFundingId(),
                        transaction.getFunding().getTitle(),
                        transaction.getBalance().longValue());

                eventDto.setTimestamp(transaction.getProcessedAt());
                initialNotifications.add(eventDto);
            }

            // 2. 펀딩 성공 알림 (FundingTransaction SUCCESS)
            List<FundingTransaction> successFundingTransactions = fundingTransactionRepository
                    .findSuccessFundingTransactionsByUserId(userId);

            for (FundingTransaction fundingTransaction : successFundingTransactions) {
                Funding funding = fundingTransaction.getFunding();
                NotificationEventDto eventDto = NotificationEventDto.createFundingSuccessEvent(
                        userId,
                        funding.getFundingId(),
                        funding.getTitle(),
                        fundingTransaction.getBalance(),
                        funding.getMaxPeople());
                eventDto.setTimestamp(fundingTransaction.getProcessedAt());
                initialNotifications.add(eventDto);
            }

            // 3. 펀딩 실패 환불 알림 (UserTransaction REFUNDED)
            List<UserTransaction> refundedTransactions = userTransactionRepository
                    .findRefundedTransactionsByUserId(userId);
            for (UserTransaction transaction : refundedTransactions) {
                NotificationEventDto eventDto = NotificationEventDto.createFundingFailedEvent(
                        userId,
                        transaction.getFunding().getFundingId(),
                        transaction.getFunding().getTitle(),
                        transaction.getBalance());
                eventDto.setTimestamp(transaction.getProcessedAt());
                initialNotifications.add(eventDto);
            }

            // (보류) 4. 투표→펀딩 전환 알림 (UserFavorite)

            // 시간순으로 정렬 (최신순)
            initialNotifications.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

            log.info("초기 알림 데이터 수집 완료 - 사용자 ID: {}, 총 알림 수: {}", userId, initialNotifications.size());

            // SSE로 리스트 형태로 한 번에 전송
            emitter.send(SseEmitter.event()
                    .id("initial_data_" + System.currentTimeMillis())
                    .name("INITIAL_DATA")
                    .data(initialNotifications));

        } catch (IOException e) {
            log.error("초기 데이터 전송 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
        }
    }

    /**
     * 특정 사용자에게 이벤트 전송
     */
    @Async("sseTaskExecutor")
    public void sendEventToUser(Long userId, NotificationEventDto event) {
        SseEmitter emitter = userConnections.get(userId);
        if (emitter == null) {
            log.debug("SSE 연결이 없는 사용자 - 사용자 ID: {}", userId);
            return;
        }

        try {
            log.info("SSE 이벤트 전송 - 사용자 ID: {}, 이벤트 타입: {}, 메시지: {}",
                    userId, event.getEventType(), event.getMessage());

            emitter.send(SseEmitter.event()
                    .id(event.getEventId())
                    .name(event.getEventType().name())
                    .data(event));

        } catch (IOException e) {
            log.error("SSE 이벤트 전송 실패 - 사용자 ID: {}, 이벤트 ID: {}, 오류: {}",
                    userId, event.getEventId(), e.getMessage());

            // 전송 실패 시 연결 제거
            userConnections.remove(userId);
            try {
                emitter.complete();
            } catch (Exception ex) {
                log.warn("SSE 연결 종료 처리 중 오류 - 사용자 ID: {}, 오류: {}", userId, ex.getMessage());
            }
        }
    }

    /**
     * 모든 연결된 사용자에게 이벤트 전송 (브로드캐스트)
     */
    @Async("sseTaskExecutor")
    public void broadcastEvent(NotificationEventDto event) {
        log.info("SSE 브로드캐스트 - 이벤트 타입: {}, 연결된 사용자 수: {}",
                event.getEventType(), userConnections.size());

        userConnections.entrySet().removeIf(entry -> {
            Long userId = entry.getKey();
            SseEmitter emitter = entry.getValue();

            try {
                emitter.send(SseEmitter.event()
                        .id(event.getEventId())
                        .name(event.getEventType().name())
                        .data(event));
                return false; // 전송 성공 시 제거하지 않음
            } catch (IOException e) {
                log.error("SSE 브로드캐스트 전송 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
                try {
                    emitter.complete();
                } catch (Exception ex) {
                    log.warn("SSE 연결 종료 처리 중 오류 - 사용자 ID: {}, 오류: {}", userId, ex.getMessage());
                }
                return true; // 전송 실패 시 제거
            }
        });
    }

}