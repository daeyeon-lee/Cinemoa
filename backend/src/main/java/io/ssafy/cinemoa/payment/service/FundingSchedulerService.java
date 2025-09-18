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
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.payment.repository.FundingTransactionRepository;
import io.ssafy.cinemoa.payment.repository.UserTransactionRepository;
import io.ssafy.cinemoa.payment.repository.entity.FundingTransaction;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import io.ssafy.cinemoa.user.repository.entity.User;
import io.ssafy.cinemoa.payment.enums.FundingTransactionState;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
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
    private final FundingTransactionRepository fundingTransactionRepository;
    private final UserTransactionRepository userTransactionRepository;
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
        log.info("■■■■■■■■ 펀딩 성공/실패 판단 스케줄러 시작 ■■■■■■■■");

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

            log.info("■■■■■■■■ 펀딩 성공/실패 판단 스케줄러 완료 ■■■■■■■■");

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
        log.info("■■■■■■■■ 영화관 송금 스케줄러 시작 ■■■■■■■■");

        try {
            // 1. 어제 성공한 펀딩들 조회 (Cinema, Screen 정보 포함)
            LocalDate yesterday = LocalDate.now().minusDays(1);
            List<Funding> successfulFundings = fundingRepository.findByEndsOnAndStateWithCinemaAndScreen(yesterday,
                    FundingState.SUCCESS);

            if (successfulFundings.isEmpty()) {
                log.info("어제 성공한 펀딩이 없습니다.");
                return;
            }

            log.info("어제 성공한 펀딩 {}개에 대해 영화관 송금을 시작합니다.", successfulFundings.size());

            // 2. 각 펀딩에 대해 영화관 계좌로 송금
            for (Funding funding : successfulFundings) {
                transferToCinema(funding);
            }

            log.info("■■■■■■■■ 영화관 송금 스케줄러 완료 ■■■■■■■■");

        } catch (Exception e) {
            log.error("영화관 송금 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 매일 오전 8시(08:00)에 실행되는 실패한 펀딩에 대한 참여자 환불 스케줄러
     * 
     * 1. 어제 실패한 펀딩들을 조회
     * 2. 각 펀딩의 계좌에서 참여자 계좌로 송금
     * 3. 환불 결과를 user_transactions 테이블에 저장
     */
    @Scheduled(cron = "0 0 8 * * *") // 매일 오전 8시
    @Transactional
    public void refundToFailedFundingParticipants() {
        log.info("■■■■■■■■ 실패한 펀딩에 대한 참여자 환불 스케줄러 시작 ■■■■■■■■");

        try {
            // 1. 어제 실패한 펀딩들 조회 (Cinema, Screen 정보 포함)
            LocalDate yesterday = LocalDate.now().minusDays(1);
            List<Funding> failedFundings = fundingRepository.findByEndsOnAndStateWithCinemaAndScreen(yesterday,
                    FundingState.FAILED);

            if (failedFundings.isEmpty()) {
                log.info("어제 실패한 펀딩이 없습니다.");
                return;
            }

            log.info("어제 실패한 펀딩 {}개에 대해 참여자 환불을 시작합니다.", failedFundings.size());

            // 2. 각 펀딩에 대해 참여자 계좌로 환불 처리
            for (Funding funding : failedFundings) {
                refundToParticipants(funding);
            }

            log.info("■■■■■■■■ 실패한 펀딩에 대한 참여자 환불 스케줄러 완료 ■■■■■■■■");

        } catch (Exception e) {
            log.error("참여자 환불 처리 중 오류 발생: {}", e.getMessage(), e);
        }
    }

    /**
     * 개별 펀딩의 성공/실패 판단 및 상태 업데이트
     */
    private void processFundingResult(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();

            // 1. 펀딩 통계 정보 조회
            FundingStat fundingStat = fundingStatRepository.findByFunding_FundingId(fundingId).orElseThrow(
                    () -> BadRequestException.ofFunding("펀딩 통계 정보를 찾을 수 없습니다. 펀딩ID: " + fundingId));

            Integer participantCount = fundingStat.getParticipantCount();
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
    private void transferToCinema(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();

            // 1. Validation 수행
            validateTransferRequirements(funding);

            // 기존 FundingTransaction 레코드에 성공 거래 존재 여부 확인
            if (fundingTransactionRepository.existsByFunding_FundingIdAndState(fundingId,
                    FundingTransactionState.SUCCESS)) {
                log.warn("성공한 Funding Transaction 레코드가 이미 존재 - 펀딩ID: {}", fundingId);
                return;
            }

            // 검증된 데이터 사용
            String fundingAccount = funding.getFundingAccount();
            Screen screen = funding.getScreen();
            Integer totalAmount = screen.getPrice();
            Cinema cinema = funding.getCinema();
            String cinemaAccountNo = getCinemaAccountNo(cinema.getCinemaName());

            // 2. 영화관 계좌로 송금 실행 (금융망 API 호출)
            AccountTransferResponse transferResponse = accountTransferApiClient.processCinemaTransfer(
                    fundingAccount,
                    cinemaAccountNo,
                    String.valueOf(totalAmount),
                    fundingId);

            // 3. 이체 결과 확인 및 로깅
            if (transferResponse.getResponseCode().equals("PAY_0000")) {
                // 성공 시 funding_transactions 테이블에 기록
                FundingTransaction fundingTransaction = FundingTransaction.builder()
                        .transactionUniqueNo(transferResponse.getTransactionUniqueNo())
                        .cinema(cinema)
                        .funding(funding)
                        .balance(totalAmount)
                        .state(FundingTransactionState.SUCCESS)
                        .processedAt(LocalDateTime.now())
                        .build();

                fundingTransactionRepository.save(fundingTransaction);

                log.info("영화관 송금 성공 - 펀딩ID: {}, 영화관: {}, 금액: {}, 거래번호: {}",
                        fundingId, cinema.getCinemaName(), totalAmount, transferResponse.getTransactionUniqueNo());
            } else {
                // 실패 시 에러 로깅
                log.error("영화관 송금 실패 - 펀딩ID: {}, 영화관: {}, 금액: {}, 에러코드: {}",
                        fundingId, cinema.getCinemaName(), totalAmount, transferResponse.getResponseCode());
                throw InternalServerException.ofTransfer();
            }

        } catch (ValidationException e) {
            log.error("펀딩 송금 중 validation 실패 - 펀딩ID: {}, 에러 내용: {}", funding.getFundingId(), e.getMessage());
            handleTransferFailure(funding, e.getMessage());
        } catch (Exception e) {
            log.error("영화관 송금 처리 중 에러 발생 - 펀딩ID: {}, 에러 내용: {}",
                    funding.getFundingId(), e.getMessage(), e);
            handleTransferFailure(funding, e.getMessage());
        }
    }

    /**
     * 개별 펀딩의 참여자 계좌로 환불 처리
     */
    private void refundToParticipants(Funding funding) {
        try {
            Long fundingId = funding.getFundingId();

            // 1. Validation 수행
            validateTransferRequirements(funding);
            String fundingAccount = funding.getFundingAccount();

            // 2. 해당 펀딩에 참여한 참여자 목록 조회 (SUCCESS 상태인 UserTransaction 목록, User 정보 포함)
            List<UserTransaction> successTransactions = userTransactionRepository
                    .findByFunding_FundingIdAndStateWithUser(fundingId, UserTransactionState.SUCCESS);

            if (successTransactions.isEmpty()) {
                log.warn("환불할 참여자가 없습니다 - 펀딩ID: {}", fundingId);
                return;
            }

            log.info("환불 처리 시작 - 펀딩ID: {}, 참여자 수: {}", fundingId, successTransactions.size());

            // 3. 각 참여자별로 환불 처리
            for (UserTransaction userTransaction : successTransactions) {
                processIndividualRefund(userTransaction, fundingId, fundingAccount);
            }

            log.info("환불 처리 완료 - 펀딩ID: {}", fundingId);

        } catch (ValidationException e) {
            log.error("참여자 환불 처리 중 validation 실패 - 펀딩ID: {}, 에러 내용: {}", funding.getFundingId(), e.getMessage());
        } catch (Exception e) {
            log.error("참여자 환불 처리 중 에러 발생 - 펀딩ID: {}, 에러 내용: {}",
                    funding.getFundingId(), e.getMessage(), e);
        }
    }

    /**
     * 개별 참여자 환불 처리
     * 
     * @param userTransaction 환불할 사용자 거래
     * @param fundingId       펀딩 ID
     * @param fundingAccount  펀딩 계좌번호
     */
    private void processIndividualRefund(UserTransaction userTransaction, Long fundingId, String fundingAccount) {

        try {
            User user = userTransaction.getUser();
            Integer refundAmount = userTransaction.getBalance();

            // 사용자 계좌 정보 조회
            String userAccountNo = user.getRefundAccountNumber();
            if (userAccountNo == null || userAccountNo.trim().isEmpty()) {
                log.warn("사용자 환불 계좌 정보가 없습니다 - 펀딩ID: {}, 사용자ID: {}", fundingId, user.getId());
                handleRefundFailure(user.getId(), fundingId, "USER_ACCOUNT_NOT_FOUND");
                return; // 메서드 종료
            }

            // 참여자 계좌로 환불 실행 (금융망 API 호출)
            AccountTransferResponse transferResponse = accountTransferApiClient.processRefundTransfer(
                    fundingAccount,
                    userAccountNo,
                    String.valueOf(refundAmount),
                    fundingId);

            // 이체 결과 확인 및 처리
            if (transferResponse.getResponseCode().equals("PAY_0000")) {
                // 성공 시 UserTransaction 상태를 REFUNDED로 업데이트
                userTransaction.setTransactionUniqueNo(transferResponse.getTransactionUniqueNo());
                userTransaction.setState(UserTransactionState.REFUNDED);
                userTransaction.setProcessedAt(LocalDateTime.now());
                userTransactionRepository.save(userTransaction);

                log.info("참여자 환불 성공 - 펀딩ID: {}, 사용자ID: {}, 환불금액: {}, 거래번호: {}",
                        fundingId, user.getId(), refundAmount, transferResponse.getTransactionUniqueNo());
            } else {
                // 실패 시 에러 로깅 및 개별 참여자 환불 실패 처리
                log.error("참여자 환불 실패 - 펀딩ID: {}, 사용자ID: {}, 환불금액: {}, 에러코드: {}",
                        fundingId, user.getId(), refundAmount, transferResponse.getResponseCode());

                handleRefundFailure(user.getId(), fundingId,
                        "REFUND_FAILED: " + transferResponse.getResponseCode());
            }

        } catch (Exception e) {
            log.error("개별 참여자 환불 처리 중 에러 발생 - 펀딩ID: {}, 사용자ID: {}, 에러: {}",
                    fundingId, userTransaction.getUser().getId(), e.getMessage(), e);

            handleRefundFailure(userTransaction.getUser().getId(), fundingId,
                    "INDIVIDUAL_REFUND_ERROR: " + e.getMessage());
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

    /**
     * 송금 요구사항 검증
     */
    private void validateTransferRequirements(Funding funding) {
        String fundingAccount = funding.getFundingAccount();
        Screen screen = funding.getScreen();
        Cinema cinema = funding.getCinema();

        // 1. 펀딩 계좌 정보 검증
        if (fundingAccount == null || fundingAccount.trim().isEmpty()) {
            throw new ValidationException("펀딩 계좌 정보가 없습니다");
        }

        // 2. 상영관 정보 검증
        if (funding.getScreen() == null) {
            throw new ValidationException("펀딩에 연결된 상영관 정보가 없습니다");
        }

        // 3. 상영관 가격 정보 검증

        if (screen != null && screen.getPrice() == null) {
            throw new ValidationException("상영관 가격 정보가 없습니다");
        }

        // 4. 영화관 계좌 정보 검증
        if (cinema == null) {
            throw new ValidationException("영화관 정보가 없습니다");
        }
        String cinemaAccountNo = getCinemaAccountNo(cinema.getCinemaName());
        if (cinemaAccountNo == null) {
            throw new ValidationException("영화관 계좌 정보를 찾을 수 없습니다: " + cinema.getCinemaName());
        }

    }

    /**
     * 펀딩 계좌 -> 영화관 계좌 송금 실패 시 공통 처리
     * 
     * - FundingTransaction 상태 업데이트
     */
    private void handleTransferFailure(Funding funding, String reason) {
        Long fundingId = funding.getFundingId();

        // 기존 레코드가 없으면 ERROR 상태로 새로 생성
        try {
            Cinema cinema = funding.getCinema();
            if (cinema != null) {
                FundingTransaction newTransaction = FundingTransaction.builder()
                        .transactionUniqueNo("FAILED")
                        .cinema(cinema)
                        .funding(funding)
                        .balance(0) // 송금 실패이므로 금액 0
                        .state(FundingTransactionState.ERROR)
                        .processedAt(LocalDateTime.now())
                        .build();

                fundingTransactionRepository.save(newTransaction);
                log.info("FundingTransaction 생성 - 펀딩ID: {}, 상태: {}, 사유: {}", fundingId,
                        FundingTransactionState.ERROR, reason);
            }
        } catch (Exception e) {
            log.error("FundingTransaction 생성 실패 - 펀딩ID: {}, 오류: {}", fundingId, e.getMessage());
        }
    }

    /**
     * 펀딩 계좌 -> 참여자 계좌 송금 실패 시 공통 처리
     * 
     * - UserTransaction 상태 업데이트
     */
    private void handleRefundFailure(Long userId, Long fundingId, String reason) {

        try {
            // User Transaction에 기록이 있는 경우
            Optional<UserTransaction> optionalTransaction = userTransactionRepository
                    .findByFunding_FundingIdAndUser_IdAndState(fundingId, userId, UserTransactionState.SUCCESS);

            if (optionalTransaction.isPresent()) {
                UserTransaction userTransaction = optionalTransaction.get();

                // ERROR 상태로 업데이트
                userTransaction.setTransactionUniqueNo("FAILED");
                userTransaction.setState(UserTransactionState.ERROR);
                userTransaction.setProcessedAt(LocalDateTime.now());
                userTransactionRepository.save(userTransaction);

                log.warn("UserTransaction 상태 업데이트 - 펀딩ID: {}, 사용자ID: {}, 상태: ERROR, 사유: {}",
                        fundingId, userId, reason);
            } else {
                log.warn("업데이트할 UserTransaction을 찾을 수 없음 - 펀딩ID: {}, 사용자ID: {}, 사유: {}",
                        fundingId, userId, reason);
            }
        } catch (Exception e) {
            log.error("UserTransaction 상태 업데이트 실패 - 펀딩ID: {}, 사용자ID: {}, 오류: {}",
                    fundingId, userId, e.getMessage());
        }
    }

    /**
     * Validation 전용 예외 클래스
     */
    private static class ValidationException extends RuntimeException {
        public ValidationException(String message) {
            super(message);
        }
    }
}
