package io.ssafy.cinemoa.payment.controller;

import io.ssafy.cinemoa.payment.service.FundingSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

/**
 * 펀딩 스케줄러 테스트용 컨트롤러
 * 
 * 실제 운영에서는 제거해야 합니다.
 */
@Slf4j
@RestController
@RequestMapping("/api/test/scheduler")
@RequiredArgsConstructor
public class FundingSchedulerTestController {

    private final FundingSchedulerService fundingSchedulerService;

    /**
     * 펀딩 성공/실패 판단 테스트
     * 
     * @param targetDate 확인할 날짜 (예: "2025-01-15")
     * @return 테스트 결과 메시지
     */
    @PostMapping("/check-funding-results")
    public String testCheckFundingResults(@RequestParam("targetDate") String targetDate) {
        log.info("펀딩 성공/실패 판단 테스트 요청 - 날짜: {}", targetDate);
        
        try {
            fundingSchedulerService.testCheckFundingResults(targetDate);
            return "펀딩 성공/실패 판단 테스트가 완료되었습니다. 로그를 확인하세요.";
        } catch (Exception e) {
            log.error("테스트 실행 중 오류 발생: {}", e.getMessage(), e);
            return "테스트 실행 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    /**
     * 영화관 송금 테스트
     * 
     * @param targetDate 확인할 날짜 (예: "2025-01-15")
     * @return 테스트 결과 메시지
     */
    @PostMapping("/transfer-to-cinema")
    public String testTransferToCinemaAccounts(@RequestParam("targetDate") String targetDate) {
        log.info("영화관 송금 테스트 요청 - 날짜: {}", targetDate);
        
        try {
            fundingSchedulerService.testTransferToCinemaAccounts(targetDate);
            return "영화관 송금 테스트가 완료되었습니다. 로그를 확인하세요.";
        } catch (Exception e) {
            log.error("테스트 실행 중 오류 발생: {}", e.getMessage(), e);
            return "테스트 실행 중 오류가 발생했습니다: " + e.getMessage();
        }
    }

    /**
     * 전체 스케줄러 테스트 (성공/실패 판단 + 송금)
     * 
     * @param targetDate 확인할 날짜 (예: "2025-01-15")
     * @return 테스트 결과 메시지
     */
    @PostMapping("/full-test")
    public String testFullScheduler(@RequestParam("targetDate") String targetDate) {
        log.info("전체 스케줄러 테스트 요청 - 날짜: {}", targetDate);
        
        try {
            // 1. 펀딩 성공/실패 판단
            fundingSchedulerService.testCheckFundingResults(targetDate);
            
            // 2. 영화관 송금
            fundingSchedulerService.testTransferToCinemaAccounts(targetDate);
            
            return "전체 스케줄러 테스트가 완료되었습니다. 로그를 확인하세요.";
        } catch (Exception e) {
            log.error("테스트 실행 중 오류 발생: {}", e.getMessage(), e);
            return "테스트 실행 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}
