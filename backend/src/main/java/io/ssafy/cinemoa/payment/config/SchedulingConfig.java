package io.ssafy.cinemoa.payment.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 펀딩 스케줄러 설정
 * 
 * FundingSchedulerService의 스케줄링 기능만 활성화
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
