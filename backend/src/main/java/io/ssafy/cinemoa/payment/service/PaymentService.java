package io.ssafy.cinemoa.payment.service;

import io.ssafy.cinemoa.external.finance.Client.AccountDepositApiClient;
import io.ssafy.cinemoa.external.finance.Client.CardApiClient;
import io.ssafy.cinemoa.external.finance.dto.CreditCardTransactionResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountDepositResponse;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.payment.dto.FundingPaymentRequest;
import io.ssafy.cinemoa.payment.dto.FundingPaymentResponse;
import io.ssafy.cinemoa.payment.dto.FundingRefundRequest;
import io.ssafy.cinemoa.payment.dto.FundingRefundResponse;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.PaymentRepository;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final FundingRepository fundingRepository;
    private final UserRepository userRepository;
    private final FundingStatRepository fundingStatRepository;
    private final CardApiClient cardApiClient;
    private final AccountDepositApiClient accountDepositApiClient;

    @Transactional
    public FundingPaymentResponse processFundingPayment(Long currentUserId, FundingPaymentRequest request) {

        Long fundingId = request.getFundingId();
        Long userId = request.getUserId();

        // 1. 사용자 정보 검증
        // if (!currentUserId.equals(targetUserId)) {
        // throw NoAuthorityException.ofUser();
        // }
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        // 2. 펀딩 존재 확인 및 조회
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // 3. 카드결제 실행 (카드 결제 API 호출)
        CreditCardTransactionResponse apiResponse = cardApiClient.createCreditCardTransaction(
                request.getCardNumber(),
                request.getCardCvc(),
                request.getAmount().toString());

        // 결제결과 성공 여부 확인
        PaymentErrorCode paymentResult = PaymentErrorCode.fromCode(apiResponse.getResponseCode());
        boolean isSuccess = paymentResult.isSuccess();

        // 4. 결제 로그 저장
        LocalDateTime processedDateTime = parseTransactionDateTime(apiResponse.getTransactionDate(),
                apiResponse.getTransactionTime());

        UserTransaction transaction = UserTransaction.builder()
                .transactionUniqueNo(apiResponse.getTransactionUniqueNo())
                .user(user)
                .funding(funding)
                .balance(isSuccess ? apiResponse.getPaymentBalance().intValue() : 0)
                .state(isSuccess ? UserTransactionState.SUCCESS : UserTransactionState.ERROR)
                .processedAt(processedDateTime)
                .build();
        UserTransaction savedTransaction = paymentRepository.save(transaction);

        // 카드 결제 성공 시
        if (isSuccess) {
            try {
                // 5. 펀딩별 계좌로 입금 처리
                // 씨네모아 가맹점으로 카드결제가 실행되고 -> 성공하면 -> 펀딩별 계좌로 입금
                processAccountDeposit(fundingId, userId, request.getAmount());

            } catch (Exception e) {
                log.error("계좌 입금 처리 중 오류 발생 - 사용자ID: {}, 펀딩ID: {}, 금액: {}, 오류: {}",
                        userId, fundingId, apiResponse.getPaymentBalance(), e.getMessage(), e);
                // 예외를 다시 던져서 트랜잭션 롤백 유발
                throw new RuntimeException("계좌 입금 처리 실패", e);
            }

            // 6. 펀딩 상태 업데이트(참가자 수 +1)
            fundingStatRepository.incrementParticipantCount(fundingId);

        } // 결제 실패 시 로깅
        else {
            log.warn("결제 실패 - 사용자: {}, 펀딩: {}, 에러코드: {}, 메시지: {}",
                    userId, fundingId, paymentResult.getCode(), paymentResult.getMessage());
        }

        return buildPaymentResponse(request, apiResponse, savedTransaction, userId, paymentResult, isSuccess);
    }

    /**
     * 펀딩 참여금 환불 처리
     */
    @Transactional
    public FundingRefundResponse processFundingRefund(Long currentUserId, FundingRefundRequest request) {
        Long fundingId = request.getFundingId();
        Long targetUserId = request.getUserId();

        // 1. 사용자 정보 검증
        // if (!currentUserId.equals(targetUserId)) {
        // throw NoAuthorityException.ofUser();
        // }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        // 2. 펀딩 존재 확인 및 조회
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // 3. 해당 사용자의 가장 최근 성공한 거래 조회
        UserTransaction successTransaction = paymentRepository
                .findTopByUserAndFundingAndStateOrderByProcessedAtDesc(user, funding, UserTransactionState.SUCCESS)
                .orElseThrow(() -> BadRequestException.ofFunding("참여하지 않은 펀딩입니다."));

        try {
            // 4-1. 거래 상태를 환불로 변경
            // successTransaction.setState(UserTransactionState.REFUNDED);
            // paymentRepository.save(successTransaction);

            // // 4-2. 펀딩 참여자 수 감소
            // fundingStatRepository.decrementParticipantCount(fundingId);

            return buildRefundResponse(successTransaction, fundingId, targetUserId, user);

        } catch (Exception e) {
            log.error("환불 처리 중 오류 발생 - 사용자ID: {}, 펀딩ID: {}, 오류: {}",
                    targetUserId, fundingId, e.getMessage(), e);
            throw InternalServerException.ofRefund();
        }
    }

    /**
     * 계좌 입금 처리
     * 
     * @param fundingId 펀딩 ID
     * @param userId    사용자 ID
     * @param amount    입금 금액
     */
    private void processAccountDeposit(Long fundingId, Long userId, Long amount) {
        // 펀딩 계좌 정보 조회
        String fundingAccount = fundingRepository.findFundingAccountByFundingId(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // 계좌 입금 API 호출
        AccountDepositResponse depositResponse = accountDepositApiClient.processAccountDeposit(
                fundingAccount,
                amount.toString(),
                "펀딩ID: " + fundingId + " 사용자ID: " + userId);

        // 계좌 입금 성공 여부 확인
        PaymentErrorCode depositResult = PaymentErrorCode.fromCode(depositResponse.getResponseCode());
        boolean isDepositSuccess = depositResult.isSuccess();

        if (isDepositSuccess) {
            log.info("펀딩 계좌 입금 성공 - 사용자ID: {}, 펀딩ID: {}, 계좌: {}, 금액: {}, 거래번호: {}",
                    userId, fundingId, fundingAccount, amount, depositResponse.getTransactionUniqueNo());
        } else {
            log.error("펀딩 계좌 입금 실패 - 사용자ID: {}, 펀딩ID: {}, 계좌: {}, 금액: {}, 에러코드: {}, 메시지: {}",
                    userId, fundingId, fundingAccount, amount,
                    depositResult.getCode(), depositResult.getMessage());
            // 계좌 입금 실패 시 예외를 던져서 트랜잭션 롤백 유발
            throw new RuntimeException("계좌 입금 실패: " + depositResult.getMessage());
        }

    }

    /**
     * 펀딩 참여금 결제 api 응답 데이터 구성
     */
    private FundingPaymentResponse buildPaymentResponse(
            FundingPaymentRequest request,
            CreditCardTransactionResponse apiResponse,
            UserTransaction savedTransaction,
            Long userId,
            PaymentErrorCode paymentResult,
            boolean isSuccess) {

        // 결제 정보 구성
        FundingPaymentResponse.PaymentInfo paymentInfo = FundingPaymentResponse.PaymentInfo.builder()
                .amount(request.getAmount())
                .cardNumber(maskCardNumber(request.getCardNumber()))
                .merchantName(apiResponse.getMerchantName())
                .transactionDateTime(LocalDateTime.now())
                .build();

        return FundingPaymentResponse.builder()
                .transactionUniqueNo(savedTransaction.getTransactionId().toString())
                .fundingId(request.getFundingId())
                .userId(userId)
                .paymentInfo(paymentInfo)
                .build();
    }

    /**
     * 펀딩 참여금 환불 api 응답 데이터 구성
     */
    private FundingRefundResponse buildRefundResponse(
            UserTransaction latestTransaction,
            Long fundingId,
            Long targetUserId,
            User user) {

        // 사용자 계좌 정보 조회 (환불 계좌)
        String userAccount = user.getRefundAccountNumber();

        FundingRefundResponse.RefundInfo refundInfo = FundingRefundResponse.RefundInfo.builder()
                .refundAmount(latestTransaction.getBalance())
                .refundAccountNo(userAccount)
                .refundDateTime(LocalDateTime.now())
                .build();

        return FundingRefundResponse.builder()
                .transactionUniqueNo(latestTransaction.getTransactionUniqueNo())
                .fundingId(fundingId)
                .userId(targetUserId)
                .refundInfo(refundInfo)
                .build();
    }

    /**
     * 카드번호 마스킹 (1234 **** **** 5678 형식)
     */
    private String maskCardNumber(String cardNo) {
        if (cardNo == null || cardNo.length() < 4) {
            return "**** **** **** ****";
        }
        return cardNo.substring(0, 4) + "-****-****-" + cardNo.substring(cardNo.length() - 4);
    }

    /**
     * API 응답의 날짜/시간을 LocalDateTime으로 변환
     */
    private LocalDateTime parseTransactionDateTime(String transactionDate, String transactionTime) {
        try {
            // 날짜 형식: "20250115", 시간 형식: "143025" 가정
            String dateTimeString = transactionDate + transactionTime;
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
            return LocalDateTime.parse(dateTimeString, formatter);
        } catch (Exception e) {
            log.warn("거래 날짜/시간 파싱 실패 - date: {}, time: {}, 현재 시간으로 대체", transactionDate, transactionTime, e);
            return LocalDateTime.now();
        }
    }

}
