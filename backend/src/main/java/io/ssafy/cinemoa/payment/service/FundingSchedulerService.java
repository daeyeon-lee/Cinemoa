package io.ssafy.cinemoa.payment.service;

import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.external.finance.Client.AccountTransferApiClient;
import io.ssafy.cinemoa.external.finance.dto.AccountTransferResponse;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import io.ssafy.cinemoa.payment.repository.FundingTransactionRepository;
// import io.ssafy.cinemoa.payment.repository.TransactionRepository;
import io.ssafy.cinemoa.payment.repository.entity.FundingTransaction;
// import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import io.ssafy.cinemoa.payment.enums.FundingTransactionState;
// import io.ssafy.cinemoa.payment.enums.UserTransactionState;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 펀딩 스케줄러 서비스
 * 
 * - 매일 자정(00:00)에 펀딩 마감일이 지난 펀딩들의 성공/실패 여부를 확인
 * - 매일 오전 7시(07:00)에 성공한 펀딩의 계좌에서 영화관 계좌로 송금
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class FundingSchedulerService {

    private final FundingRepository fundingRepository;
    private final FundingStatRepository fundingStatRepository;
    // private final TransactionRepository transactionRepository;
    private final FundingTransactionRepository fundingTransactionRepository;
    private final AccountTransferApiClient accountTransferApiClient;

    @Value("${finance.cinema-accounts.cgv.account-no}")
    private String cgvAccountNo;

    @Value("${finance.cinema-accounts.lotte.account-no}")
    private String lotteAccountNo;

    @Value("${finance.cinema-accounts.megabox.account-no}")
    private String megaboxAccountNo;

    @Value("${finance.cinema-accounts.other.account-no}")
    private String otherAccountNo;

    /**
     * 매일 자정(00:00)에 실행되는 펀딩 성공/실패 판단 스케줄러
     * 
     * 1. 어제 마감된 펀딩들을 조회
     * 2. 각 펀딩의 참여자 수와 목표 인원을 비교하여 성공/실패 판단
     * 3. 펀딩 상태를 SUCCESS 또는 FAILED로 업데이트
     */
    @Scheduled(cron = "0 0 0 * * *") // 매일 자정
    @Transactional
    public void checkFundingResults() {
        log.info("■■■■■■■■펀딩 성공/실패 판단 스케줄러 시작■■■■■■■■");
        
        try {
            // 1. 어제 마감된 펀딩들 조회 (ON_PROGRESS 상태인 것들만)
            LocalDate yesterday = LocalDate.now().minusDays(1);
            List<Funding> expiredFundings = fundingRepository.findByEndsOnAndState(yesterday, FundingState.ON_PROGRESS);
            
            if (expiredFundings.isEmpty()) {
                log.info("어제 마감된 펀딩이 없습니다.");
                return;
            }

            log.info("어제 마감된 펀딩 {}개를 확인합니다.", expiredFundings.size());

            // 2. 각 펀딩의 성공/실패 판단 및 상태 업데이트
            for (Funding funding : expiredFundings) {
                processFundingResult(funding);
            }

            log.info("■■■■■■■■펀딩 성공/실패 판단 스케줄러 완료■■■■■■■■");

        } catch (Exception e) {
            log.error("펀딩 성공/실패 판단 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 매일 오전 7시(07:00)에 실행되는 영화관 송금 스케줄러
     * 
     * 1. 어제 성공한 펀딩들을 조회
     * 2. 각 펀딩의 계좌에서 영화관 계좌로 송금
     * 3. 송금 결과를 funding_transactions 테이블에 저장
     */
    @Scheduled(cron = "0 0 7 * * *") // 매일 오전 7시
    @Transactional
    public void transferToCinemaAccounts() {
        log.info("■■■■■■■■영화관 송금 스케줄러 시작■■■■■■■■");
        
        try {
            // 1. 어제 성공한 펀딩들 조회 (Cinema, Screen 정보 포함)
            // LazyInitializationException 해결을 위해 Cinema, Screen 정보 포함하여 조회
            LocalDate yesterday = LocalDate.now().minusDays(1);
            // List<Funding> successfulFundings = fundingRepository.findByEndsOnAndStateWithCinema(yesterday, FundingState.SUCCESS);
            List<Funding> successfulFundings = fundingRepository.findByEndsOnAndStateWithCinemaAndScreen(yesterday, FundingState.SUCCESS);
            
            if (successfulFundings.isEmpty()) {
                log.info("어제 성공한 펀딩이 없습니다.");
                return;
            }

            log.info("어제 성공한 펀딩 {}개에 대해 영화관 송금을 시작합니다.", successfulFundings.size());

            // 2. 각 펀딩에 대해 영화관 계좌로 송금
            for (Funding funding : successfulFundings) {
                processCinemaTransfer(funding);
            }

            log.info("■■■■■■■■영화관 송금 스케줄러 완료■■■■■■■■");

        } catch (Exception e) {
            log.error("영화관 송금 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 개별 펀딩의 성공/실패 판단 및 상태 업데이트
     */
    private void processFundingResult(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();
            
            // 1. 펀딩 통계 정보 조회
            Optional<FundingStat> statOpt = fundingStatRepository.findByFunding_FundingId(fundingId);
            if (statOpt.isEmpty()) {
                log.warn("펀딩 통계 정보를 찾을 수 없습니다. 펀딩ID: {}", fundingId);
                return;
            }

            FundingStat stat = statOpt.get();
            Integer participantCount = stat.getParticipantCount();
            Integer maxPeople = funding.getMaxPeople();

            // 2. 성공/실패 판단 (참여자 수 >= 목표 인원)
            boolean isSuccess = participantCount >= maxPeople;
            FundingState newState = isSuccess ? FundingState.SUCCESS : FundingState.FAILED;

            // 3. 펀딩 상태 업데이트
            funding.setState(newState);
            fundingRepository.save(funding);

            log.info("펀딩 결과 업데이트 - 펀딩ID: {}, 제목: {}, 참여자수: {}/{}, 결과: {}",
                fundingId, funding.getTitle(), participantCount, maxPeople, newState);

        } catch (Exception e) {
            log.error("펀딩 결과 처리 중 오류 발생 - 펀딩ID: {}, 오류: {}", 
                funding.getFundingId(), e.getMessage(), e);
        }
    }

    /**
     * 개별 펀딩의 영화관 계좌 송금 처리
     */
    private void processCinemaTransfer(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();
            
            // 1. 펀딩 계좌 정보 확인
            String fundingAccount = funding.getFundingAccount();
            if (fundingAccount == null || fundingAccount.trim().isEmpty()) {
                log.warn("펀딩 계좌 정보가 없습니다. 펀딩ID: {}", fundingId);
                return;
            }

            // 2. 펀딩에 모인 총 금액 계산 (성공한 거래들의 합계)
            // List<UserTransaction> successfulTransactions = transactionRepository
            //     .findByFunding_FundingIdAndState(fundingId, UserTransactionState.SUCCESS);
            
            // if (successfulTransactions.isEmpty()) {
            //     log.warn("성공한 거래가 없습니다. 펀딩ID: {}", fundingId);
            // 2. 펀딩에 모인 총 금액 계산 (Screen의 price 값 사용)
            Screen screen = funding.getScreen();
            if (screen == null) {
                log.warn("펀딩에 연결된 상영관 정보가 없습니다. 펀딩ID: {}", fundingId);
                return;
            }

            Integer screenPrice = screen.getPrice();
            if (screenPrice == null) {
                log.warn("상영관 가격 정보가 없습니다. 펀딩ID: {}, 상영관ID: {}", fundingId, screen.getScreenId());
                return;
            }

            // int totalAmount = successfulTransactions.stream()
            //     .mapToInt(UserTransaction::getBalance)
            //     .sum();
            int totalAmount = screenPrice;


            // 3. 영화관 계좌 정보 조회
            Cinema cinema = funding.getCinema();
            String cinemaAccountNo = getCinemaAccountNo(cinema.getCinemaName());
            
            if (cinemaAccountNo == null) {
                log.warn("영화관 계좌 정보를 찾을 수 없습니다. 영화관: {}", cinema.getCinemaName());
                return;
            }

            // 4. 계좌 이체 API 호출
            AccountTransferResponse transferResponse = accountTransferApiClient.processAccountTransfer(
                fundingAccount,
                cinemaAccountNo,
                String.valueOf(totalAmount),
                fundingId
            );

            // 5. 이체 결과 확인 및 로깅
            PaymentErrorCode transferResult = PaymentErrorCode.fromCode(transferResponse.getResponseCode());
            boolean isTransferSuccess = transferResult.isSuccess();

            if (isTransferSuccess) {
                // 6. 성공 시 funding_transactions 테이블에 기록
                FundingTransaction fundingTransaction = FundingTransaction.builder()
                    .transactionUniqueNo(transferResponse.getTransactionUniqueNo())
                    .cinema(cinema)
                    .funding(funding)
                    .balance(totalAmount)
                    .state(FundingTransactionState.SUCCESS)
                    .build();
                
                fundingTransactionRepository.save(fundingTransaction);

                log.info("영화관 송금 성공 - 펀딩ID: {}, 영화관: {}, 금액: {}, 거래번호: {}",
                    fundingId, cinema.getCinemaName(), totalAmount, transferResponse.getTransactionUniqueNo());
            } else {
                // 7. 실패 시 에러 로깅
                log.error("영화관 송금 실패 - 펀딩ID: {}, 영화관: {}, 금액: {}, 에러코드: {}, 메시지: {}",
                    fundingId, cinema.getCinemaName(), totalAmount, 
                    transferResult.getCode(), transferResult.getMessage());
            }

        } catch (Exception e) {
            log.error("영화관 송금 처리 중 오류 발생 - 펀딩ID: {}, 오류: {}", 
                funding.getFundingId(), e.getMessage(), e);
        }
    }

    /**
     * 영화관명에 따른 계좌번호 반환
     */
    private String getCinemaAccountNo(String cinemaName) {
        if (cinemaName == null) {
            return otherAccountNo;
        }

        String upperCinemaName = cinemaName.toUpperCase();
        
        if (upperCinemaName.startsWith("CGV")) {
            return cgvAccountNo;
        } else if (upperCinemaName.startsWith("롯데") || upperCinemaName.startsWith("LOTTE")) {
            return lotteAccountNo;
        } else if (upperCinemaName.startsWith("메가박스") || upperCinemaName.startsWith("MEGABOX")) {
            return megaboxAccountNo;
        } else {
            return otherAccountNo;
        }
    }

    // ========== 테스트용 메서드들 ==========

    /**
     * 테스트용: 펀딩 성공/실패 판단 수동 실행
     * 
     * @param targetDate 확인할 날짜 (예: "2025-01-15")
     */
    public void testCheckFundingResults(String targetDate) {
        log.info("■■■■■■■■테스트: 펀딩 성공/실패 판단 실행 - 대상일: {}■■■■■■■■", targetDate);
        
        try {
            LocalDate date = LocalDate.parse(targetDate);
            List<Funding> expiredFundings = fundingRepository.findByEndsOnAndState(date, FundingState.ON_PROGRESS);
            
            if (expiredFundings.isEmpty()) {
                log.info("해당 날짜에 마감된 펀딩이 없습니다: {}", targetDate);
                return;
            }

            log.info("해당 날짜에 마감된 펀딩 {}개를 확인합니다.", expiredFundings.size());

            for (Funding funding : expiredFundings) {
                processFundingResult(funding);
            }

            log.info("■■■■■■■■테스트: 펀딩 성공/실패 판단 완료■■■■■■■■");

        } catch (Exception e) {
            log.error("테스트 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 테스트용: 영화관 송금 수동 실행
     * 
     * @param targetDate 확인할 날짜 (예: "2025-01-15")
     */
    public void testTransferToCinemaAccounts(String targetDate) {
        log.info("■■■■■■■■테스트: 영화관 송금 실행 - 대상일: {}■■■■■■■■", targetDate);
        
        try {
            LocalDate date = LocalDate.parse(targetDate);
            List<Funding> successfulFundings = fundingRepository.findByEndsOnAndStateWithCinemaAndScreen(date, FundingState.SUCCESS);
            
            if (successfulFundings.isEmpty()) {
                log.info("해당 날짜에 성공한 펀딩이 없습니다: {}", targetDate);
                return;
            }

            log.info("해당 날짜에 성공한 펀딩 {}개에 대해 영화관 송금을 시작합니다.", successfulFundings.size());

            for (Funding funding : successfulFundings) {
                processCinemaTransfer(funding);
            }

            log.info("■■■■■■■■테스트: 영화관 송금 완료■■■■■■■■");

        } catch (Exception e) {
            log.error("테스트 중 오류 발생: {}", e.getMessage(), e);
        }
    }
}
