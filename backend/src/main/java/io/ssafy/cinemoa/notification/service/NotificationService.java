package io.ssafy.cinemoa.notification.service;

import io.ssafy.cinemoa.notification.dto.NotificationEventDto;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Slf4j
public class NotificationService {

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