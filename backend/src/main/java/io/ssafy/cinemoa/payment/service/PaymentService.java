package io.ssafy.cinemoa.payment.service;

import io.ssafy.cinemoa.external.finance.Client.AccountDepositApiClient;
import io.ssafy.cinemoa.external.finance.Client.CardApiClient;
import io.ssafy.cinemoa.external.finance.dto.CreditCardTransactionResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountDepositResponse;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.payment.dto.FundingPaymentRequest;
import io.ssafy.cinemoa.payment.dto.FundingPaymentResponse;
import io.ssafy.cinemoa.payment.enums.TransactionState;
import io.ssafy.cinemoa.payment.repository.PaymentRepository;
import io.ssafy.cinemoa.payment.repository.entity.Transaction;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public FundingPaymentResponse processFundingPayment(Long userId, FundingPaymentRequest request) {

        // 1. 요청 데이터 검증 및 가져오기
        Long fundingId = request.getFundingId();
        // Long amount = request.getAmount();
        // String cardNumber = request.getCardNumber();
        // String cardCvc = request.getCardCvc();

        // 2. 펀딩 존재 확인 및 조회
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // 3. 사용자 정보 검증
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        // 4. 카드결제 실행 (카드 결제 API 호출)
        CreditCardTransactionResponse apiResponse = cardApiClient.createCreditCardTransaction(
                request.getCardNumber(),
                request.getCardCvc(),
                request.getAmount().toString());

        // 결제결과 성공 여부 확인
        PaymentErrorCode paymentResult = PaymentErrorCode.fromCode(apiResponse.getResponseCode());
        boolean isSuccess = paymentResult.isSuccess();

        // 5. 결제 로그 저장
        Transaction transaction = Transaction.builder()
                .transactionUniqueNo(apiResponse.getTransactionUniqueNo())
                .user(user)
                .funding(funding)
                .balance(isSuccess ? apiResponse.getPaymentBalance().intValue() : 0)
                .state(isSuccess ? TransactionState.SUCCESS : TransactionState.ERROR)
                .build();
        Transaction savedTransaction = paymentRepository.save(transaction);

        // 카드 결제 성공 시
        if (isSuccess) {
            try {
                // 6. 펀딩별 계좌로 입금 처리
                // 씨네모아 가맹점으로 카드결제가 실행되고 -> 성공하면 -> 펀딩별 계좌로 입금
                processAccountDeposit(fundingId, userId, request.getAmount());

            } catch (Exception e) {
                log.error("계좌 입금 처리 중 오류 발생 - 사용자ID: {}, 펀딩ID: {}, 금액: {}, 오류: {}",
                        userId, fundingId, apiResponse.getPaymentBalance(), e.getMessage(), e);
                // 예외를 다시 던져서 트랜잭션 롤백 유발
                throw new RuntimeException("계좌 입금 처리 실패", e);
            }

            // 7. 펀딩 상태 업데이트(참가자 수 +1)
            fundingStatRepository.incrementParticipantCount(fundingId);

        } // 결제 실패 시 로깅
        else {
            log.warn("결제 실패 - 사용자: {}, 펀딩: {}, 에러코드: {}, 메시지: {}",
                    userId, fundingId, paymentResult.getCode(), paymentResult.getMessage());
        }

        // 8. 응답 데이터 구성
        return buildPaymentResponse(request, apiResponse, savedTransaction, userId, paymentResult, isSuccess);
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
     * 결제 응답 데이터 구성
     */
    private FundingPaymentResponse buildPaymentResponse(
            FundingPaymentRequest request,
            CreditCardTransactionResponse apiResponse,
            Transaction savedTransaction,
            Long userId,
            PaymentErrorCode paymentResult,
            boolean isSuccess) {

        return FundingPaymentResponse.builder()
                .transactionUniqueNo(savedTransaction.getTransactionId().toString())
                .fundingId(request.getFundingId())
                .userId(userId)
                .paymentInfo(buildPaymentInfo(request, apiResponse))
                .build();
    }

    /**
     * 결제 정보 구성
     */
    private FundingPaymentResponse.PaymentInfo buildPaymentInfo(
            FundingPaymentRequest request,
            CreditCardTransactionResponse apiResponse) {

        return FundingPaymentResponse.PaymentInfo.builder()
                .amount(request.getAmount())
                .cardNumber(maskCardNumber(request.getCardNumber()))
                .merchantName(apiResponse.getMerchantName())
                .transactionDate(apiResponse.getTransactionDate())
                .transactionTime(apiResponse.getTransactionTime())
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

}
