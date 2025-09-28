package io.ssafy.cinemoa.notification.service;

import io.ssafy.cinemoa.favorite.repository.UserFavoriteRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.notification.dto.NotificationEventDto;
import io.ssafy.cinemoa.notification.enums.NotificationEventType;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.UserTransactionRepository;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import java.io.IOException;
import java.time.LocalDateTime;
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
    private final UserFavoriteRepository userFavoriteRepository;

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

        return emitter;
    }

    /**
     * SSE 연결 직후 초기 데이터 전송
     */
    @Async("sseTaskExecutor")
    public void sendInitialData(Long userId, SseEmitter emitter) {
        try {
            log.info("SSE 초기 데이터 전송 시작 - 사용자 ID: {}", userId);

            // TODO: DB에서 해당 userId의 과거 알림 이력 조회
            List<NotificationEventDto> pastEvents = loadPastEvents(userId);

            emitter.send(SseEmitter.event()
                    .id("initial_data_" + System.currentTimeMillis())
                    .name("INITIAL_DATA")
                    .data(pastEvents));

            log.info("SSE 초기 데이터 전송 완료 - 사용자 ID: {}, 알림 개수: {}",
                    userId, pastEvents.size());

        } catch (Exception e) {
            log.error("SSE 초기 데이터 전송 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
        }
    }

    /**
     * 과거 알림 이력 조회 (실제 DB 조회)
     */
    private List<NotificationEventDto> loadPastEvents(Long userId) {
        List<NotificationEventDto> pastEvents = new ArrayList<>();
        
        try {
            // 1. 결제 성공 이력 조회 (최근 30일) - Funding 정보 포함
            List<UserTransaction> paymentHistory = userTransactionRepository
                    .findByUser_IdAndStateAndCreatedAtAfterWithFunding(
                            userId, 
                            UserTransactionState.SUCCESS, 
                            LocalDateTime.now().minusDays(30)
                    );
            
            for (UserTransaction transaction : paymentHistory) {
                Funding funding = transaction.getFunding();
                if (funding != null) {
                    NotificationEventDto paymentEvent = NotificationEventDto.builder()
                            .eventId("past_payment_" + transaction.getTransactionId())
                            .eventType(NotificationEventType.PAYMENT_SUCCESS)
                            .userId(userId)
                            .message(String.format("'%s' 펀딩에 %,d원이 결제되었습니다.", 
                                    truncateTitle(funding.getTitle(), 15), transaction.getBalance()))
                            .data(NotificationEventDto.PaymentSuccessData.builder()
                                    .fundingId(funding.getFundingId())
                                    .fundingTitle(funding.getTitle())
                                    .amount((long) transaction.getBalance())
                                    .build())
                            .timestamp(transaction.getCreatedAt())
                            .build();
                    pastEvents.add(paymentEvent);
                }
            }
            
            // 2. 관심 등록 이력 조회 (최근 30일) - 임시로 빈 리스트 처리
            // TODO: UserFavoriteRepository에 필요한 메서드 추가 후 구현
            
            // 최신순으로 정렬
            pastEvents.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));
            
            log.info("과거 알림 이력 조회 완료 - 사용자 ID: {}, 이벤트 수: {}", userId, pastEvents.size());
            
        } catch (Exception e) {
            log.error("과거 알림 이력 조회 실패 - 사용자 ID: {}, 오류: {}", userId, e.getMessage());
        }
        
        return pastEvents;
    }
    
    // 펀딩 제목이 maxLength를 초과하면 축약 처리
    private String truncateTitle(String fundingTitle, int maxLength) {
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

        } catch (Exception e) {
            // ✅ 모든 예외를 안전하게 처리하여 ExceptionControllerAdvice로 전파되지 않도록 함
            log.error("SSE 이벤트 전송 실패 - 사용자 ID: {}, 이벤트 ID: {}, 오류: {}",
                    userId, event.getEventId(), e.getMessage());

            // 전송 실패 시 연결 제거
            userConnections.remove(userId);
            try {
                emitter.complete();
            } catch (Exception ex) {
                log.warn("SSE 연결 종료 처리 중 오류 - 사용자 ID: {}, 오류: {}", userId, ex.getMessage());
            }
            
            // ✅ 예외를 삼켜서 ExceptionControllerAdvice로 전파되지 않도록 함
            // SSE 전송 실패는 전체 시스템에 영향을 주지 않아야 함
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
            } catch (Exception e) {
                // ✅ 모든 예외를 안전하게 처리하여 ExceptionControllerAdvice로 전파되지 않도록 함
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