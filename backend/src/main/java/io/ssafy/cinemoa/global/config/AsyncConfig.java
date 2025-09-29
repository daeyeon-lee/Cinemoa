package io.ssafy.cinemoa.global.config;

import java.util.concurrent.Executor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig {

    /**
     * SSE 알림 전송용 비동기 실행기
     */
    @Bean(name = "sseTaskExecutor")
    public Executor sseTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2); // 기본 스레드 수
        executor.setMaxPoolSize(10); // 최대 스레드 수
        executor.setQueueCapacity(100); // 대기 큐 크기
        executor.setThreadNamePrefix("SSE-"); // 스레드 이름 접두사
        executor.setKeepAliveSeconds(60); // 유휴 스레드 유지 시간

        // 태스크 거부 정책: 호출자 스레드에서 실행
        executor.setRejectedExecutionHandler((runnable, threadPoolExecutor) -> {
            log.warn("SSE 태스크 큐가 가득참. 호출자 스레드에서 실행: {}", runnable.toString());
            runnable.run();
        });

        executor.initialize();

        log.info("SSE 비동기 실행기 초기화 완료 - CorePool: {}, MaxPool: {}, QueueCapacity: {}",
                executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());

        return executor;
    }

    /**
     * 일반 비동기 작업용 실행기
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(4);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(200);
        executor.setThreadNamePrefix("Async-");
        executor.setKeepAliveSeconds(60);

        executor.setRejectedExecutionHandler((runnable, threadPoolExecutor) -> {
            log.warn("일반 태스크 큐가 가득함. 호출자 스레드에서 실행: {}", runnable.toString());
            runnable.run();
        });

        executor.initialize();

        log.info("일반 비동기 실행기 초기화 완료 - CorePool: {}, MaxPool: {}, QueueCapacity: {}",
                executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());

        return executor;
    }
}
