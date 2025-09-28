package io.ssafy.cinemoa.notification.controller;

import io.ssafy.cinemoa.notification.service.NotificationService;
import io.ssafy.cinemoa.security.helper.SecurityContextHelper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notification")
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    private final SecurityContextHelper securityContextHelper;

    /**
     * SSE 연결 생성 (알림 구독)
     */
    @GetMapping(value = "/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe() {
        Long userId = securityContextHelper.getCurrentUserId();

        log.info("=== SSE 연결 요청 - 사용자 ID: {} ===", userId);

        SseEmitter emitter = notificationService.createConnection(userId);

        // ✅ 연결 직후 초기 데이터 전송
        notificationService.sendInitialData(userId, emitter);

        log.info("SSE 연결 생성 완료 - 사용자 ID: {}", userId);

        return emitter;
    }

}
