package io.ssafy.cinemoa.payment.service;

import io.ssafy.cinemoa.external.finance.Client.AccountDepositApiClient;
import io.ssafy.cinemoa.external.finance.Client.AccountTransferApiClient;
import io.ssafy.cinemoa.external.finance.Client.CardApiClient;
import io.ssafy.cinemoa.external.finance.dto.AccountDepositResponse;
import io.ssafy.cinemoa.external.finance.dto.AccountTransferResponse;
import io.ssafy.cinemoa.external.finance.dto.CreditCardTransactionResponse;
import io.ssafy.cinemoa.funding.exception.SeatLockException;
import io.ssafy.cinemoa.funding.repository.FundingRepository;
import io.ssafy.cinemoa.funding.repository.FundingStatRepository;
import io.ssafy.cinemoa.funding.repository.entity.Funding;
import io.ssafy.cinemoa.funding.repository.entity.FundingStat;
import io.ssafy.cinemoa.global.enums.PaymentErrorCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import io.ssafy.cinemoa.global.exception.NoAuthorityException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.redis.service.RedisService;
import io.ssafy.cinemoa.notification.service.FundingNotificationService;
import io.ssafy.cinemoa.payment.dto.FundingPaymentRequest;
import io.ssafy.cinemoa.payment.dto.FundingPaymentResponse;
import io.ssafy.cinemoa.payment.dto.FundingRefundRequest;
import io.ssafy.cinemoa.payment.dto.FundingRefundResponse;
import io.ssafy.cinemoa.payment.enums.FundingOperationContext;
import io.ssafy.cinemoa.payment.enums.UserTransactionState;
import io.ssafy.cinemoa.payment.repository.PaymentRepository;
import io.ssafy.cinemoa.payment.repository.entity.UserTransaction;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
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
    private final AccountTransferApiClient accountTransferApiClient;
    private final RedisService redisService;
    private final FundingNotificationService fundingNotificationService;

    /**
     * 펀딩 참여 처리
     *
     * @param currentUserId 현재 사용자 ID
     * @param request       펀딩 참여 요청 데이터
     * @return FundingPaymentResponse 펀딩 참여 처리 결과
     * @throws ResourceNotFoundException 펀딩 또는 사용자를 찾을 수 없는 경우
     * @throws RuntimeException          카드 결제 실패 OR 계좌 입금 실패 시
     * @author HG
     */
    @Transactional
    public FundingPaymentResponse participateInFunding(Long currentUserId, FundingPaymentRequest request) {

        Long fundingId = request.getFundingId();
        Long userId = request.getUserId();
        Long amount = request.getAmount();

        // 1. 사용자 정보 검증
        // if (!currentUserId.equals(targetUserId)) {
        // throw NoAuthorityException.ofUser();
        // }

        String seatKey = "seat:" + fundingId + ":" + userId;

        if (!redisService.exists(seatKey)) {
            throw SeatLockException.ofNotHolding();
        }

        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        // 2. 펀딩 존재 확인 및 조회
        Funding funding = fundingRepository.findById(fundingId)
                .orElseThrow(ResourceNotFoundException::ofFunding);

        // 2-1. 현재가 펀딩 종료일 이전인지 검증
        validateFundingNotExpired(funding, FundingOperationContext.PAYMENT);

        // 2-2. 펀딩 참여자 수 검증 (최대 인원 초과 여부 확인)
        validateFundingCapacity(fundingId, funding.getMaxPeople());

        // 2-3. 중복 참여 검증 (이미 참여한 사용자인지 확인)
        validateDuplicateParticipation(user, funding);

        // 3. 카드결제 실행 (금융망 API 호출)
        CreditCardTransactionResponse apiResponse = cardApiClient.createCreditCardTransaction(
                request.getCardNumber(),
                request.getCardCvc(),
                amount.toString());

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
                processAccountDeposit(fundingId, userId, amount);

            } catch (Exception e) {
                log.error("계좌 입금 처리 중 오류 발생 - 사용자ID: {}, 펀딩ID: {}, 금액: {}, 오류: {}",
                        userId, fundingId, apiResponse.getPaymentBalance(), e.getMessage(), e);
                // 예외를 다시 던져서 트랜잭션 롤백 유발
                throw new RuntimeException("계좌 입금 처리 실패", e);
            }

            // 6. 펀딩 상태 업데이트(참여자 수 +1)
            fundingStatRepository.incrementParticipantCount(fundingId);
            redisService.removeKey(seatKey);

            // 7. SSE 알림 전송 (결제 성공)
            fundingNotificationService.notifyPaymentSuccess(userId, funding, amount);

        } // 결제 실패 시 로깅
        else {
            log.warn("결제 실패 - 사용자: {}, 펀딩: {}, 에러코드: {}, 메시지: {}",
                    userId, fundingId, paymentResult.getCode(), paymentResult.getMessage());
            throw InternalServerException.ofPayment();
        }

        return buildPaymentResponse(request, apiResponse, savedTransaction, userId, paymentResult, isSuccess);
    }

    /**
     * 펀딩 참여금 환불 처리
     *
     * @param currentUserId 현재 사용자 ID (권한 검증용)
     * @param request       펀딩 환불 요청 데이터 (펀딩 ID, 대상 사용자 ID 포함)
     * @return FundingRefundResponse 환불 처리 결과
     * @throws NoAuthorityException      현재 사용자가 대상 사용자와 다른 경우
     * @throws ResourceNotFoundException 펀딩 또는 사용자를 찾을 수 없는 경우
     * @throws BadRequestException       참여하지 않은 펀딩에 대한 환불 요청 시
     * @throws InternalServerException   환불 처리 중 오류 발생 시
     * @author HG
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

        // 2-1. 현재가 펀딩 종료일 이전인지 검증
        validateFundingNotExpired(funding, FundingOperationContext.REFUND);

        // 3. 해당 사용자의 가장 최근 성공한 거래 조회
        UserTransaction successTransaction = paymentRepository
                .findTopByUserAndFundingAndStateOrderByProcessedAtDesc(user, funding,
                        UserTransactionState.SUCCESS)
                .orElseThrow(() -> BadRequestException.ofFunding("참여하지 않은 펀딩입니다."));

        try {
            // 4-1. 사용자 환불계좌 조회 및 검증
            String refundAccountNo = user.getRefundAccountNumber();
            if (refundAccountNo == null || refundAccountNo.trim().isEmpty()) {
                log.error("사용자 환불 계좌 정보 없음 - 사용자ID: {}", targetUserId);
                throw BadRequestException.ofFunding("사용자 환불 계좌 정보 없음");

            }

            // 4-2. 실제 환불 처리 (금융망 API 호출. 펀딩용 계좌 -> 사용자 환불 계좌로 계좌이체)
            // 계좌이체 실행 (금융망 API 호출)
            AccountTransferResponse apiResponse = accountTransferApiClient
                    .processRefundTransfer(funding.getFundingAccount(), refundAccountNo,
                            successTransaction.getBalance().toString(), fundingId);

            // 계좌이체 결과 성공 여부 확인
            PaymentErrorCode paymentResult = PaymentErrorCode.fromCode(apiResponse.getResponseCode());
            boolean isSuccess = paymentResult.isSuccess();

            // 계좌이체 성공 시
            if (isSuccess) {

                // 4-3. 거래 상태를 환불로 UPDATE
                successTransaction.setState(UserTransactionState.REFUNDED);
                successTransaction.setProcessedAt(LocalDateTime.now());
                successTransaction.setTransactionUniqueNo(apiResponse.getTransactionUniqueNo());
                paymentRepository.save(successTransaction);

                // 4-4. 펀딩 상태 업데이트(참여자 수 -1)
                fundingStatRepository.decrementParticipantCount(fundingId);

                log.info("환불 처리 완료 - 환불 대상 사용자ID: {}, 펀딩ID: {}, 환불금액: {}, 환불계좌: {}",
                        targetUserId, fundingId, successTransaction.getBalance(),
                        maskAccountNumber(refundAccountNo));

                // 4-5. SSE 알림 전송 (환불 성공)
                fundingNotificationService.notifyFundingRefund(user, funding, successTransaction.getBalance());

            } // 계좌이체 실패 시 로깅
            else {
                log.warn("환불 처리 실패 - 환불 대상 사용자ID: {}, 펀딩: {}, 에러코드: {}, 메시지: {}",
                        targetUserId, fundingId, paymentResult.getCode(), paymentResult.getMessage());
                throw InternalServerException.ofRefund();
            }

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
                    userId, fundingId, fundingAccount, amount,
                    depositResponse.getTransactionUniqueNo());
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
    private FundingRefundResponse buildRefundResponse(UserTransaction latestTransaction, Long fundingId,
                                                      Long targetUserId, User user) {

        FundingRefundResponse.RefundInfo refundInfo = FundingRefundResponse.RefundInfo.builder()
                .refundAmount(latestTransaction.getBalance())
                .refundAccountNo(user.getRefundAccountNumber()) // 사용자 계좌 정보 조회 (환불 계좌)
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
     * 계좌번호 마스킹 (1234-****-****-5678 형식)
     */
    private String maskAccountNumber(String accountNo) {
        if (accountNo == null || accountNo.length() < 8) {
            return "****-****-****-****";
        }
        return accountNo.substring(0, 4) + "-****-****-" + accountNo.substring(accountNo.length() - 4);
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
            log.warn("거래 날짜/시간 파싱 실패 - date: {}, time: {}, 현재 시간으로 대체", transactionDate, transactionTime,
                    e);
            return LocalDateTime.now();
        }
    }

    /**
     * 펀딩 종료 시간 검증
     * <p>
     * 현재 시간이 펀딩 종료 시간(endsOn) 이후인지 확인하고, 종료된 펀딩에 대한 요청을 차단합니다.
     *
     * @param funding 검증할 펀딩 객체
     * @param context 호출 컨텍스트 (PAYMENT 또는 REFUND)
     * @throws BadRequestException 펀딩이 종료된 경우
     */
    private void validateFundingNotExpired(Funding funding, FundingOperationContext context) {
        LocalDate currentDate = LocalDate.now();
        LocalDate fundingEndDate = funding.getEndsOn();

        // 종료된 펀딩인 경우
        if (fundingEndDate != null && currentDate.isAfter(fundingEndDate)) {
            log.warn("종료된 펀딩에 대한 {} 시도 - 펀딩ID: {}, 종료일: {}, 현재일: {}",
                    context.getOperationType(), funding.getFundingId(), fundingEndDate, currentDate);

            String errorMessage = context.getValidationErrorMessage() + " 종료일: " + fundingEndDate;
            throw BadRequestException.ofFunding(errorMessage);
        }
    }

    /**
     * 펀딩 참여 인원 검증
     * <p>
     * 현재 참여자 수가 최대 인원에 도달했는지 확인하고, 초과된 경우 참여를 차단합니다.
     *
     * @param fundingId 펀딩 ID
     * @param maxPeople 최대 참여 인원
     * @throws BadRequestException 참여 인원이 가득 찬 경우
     */
    private void validateFundingCapacity(Long fundingId, Integer maxPeople) {
        // 펀딩 통계 정보 조회
        FundingStat fundingStat = fundingStatRepository.findByFunding_FundingId(fundingId)
                .orElseThrow(() -> BadRequestException.ofFunding("펀딩 통계 정보를 찾을 수 없습니다."));

        Integer currentParticipants = fundingStat.getParticipantCount();

        // 참여 인원이 최대 인원에 도달한 경우
        if (currentParticipants >= maxPeople) {
            log.warn("펀딩 참여 인원 초과 - 펀딩ID: {}, 현재 참여자: {}, 최대 인원: {}",
                    fundingId, currentParticipants, maxPeople);

            throw BadRequestException.ofFunding(
                    String.format("펀딩 참여 인원이 가득 찼습니다. (현재: %d/%d명)", currentParticipants, maxPeople));
        }
    }

    /**
     * 중복 참여 검증
     * <p>
     * 현재 사용자가 해당 펀딩에 이미 참여했는지 확인하고, 이미 참여한 경우 중복 참여를 차단합니다.
     *
     * @param user    현재 사용자
     * @param funding 펀딩 객체
     * @throws BadRequestException 이미 참여한 펀딩인 경우
     */
    private void validateDuplicateParticipation(User user, Funding funding) {
        // 해당 사용자의 성공한 거래 내역이 있는지 확인
        boolean hasParticipated = paymentRepository
                .findTopByUserAndFundingAndStateOrderByProcessedAtDesc(user, funding, UserTransactionState.SUCCESS)
                .isPresent();

        if (hasParticipated) {
            log.warn("중복 참여 시도 - 사용자ID: {}, 펀딩ID: {}",
                    user.getId(), funding.getFundingId());

            throw BadRequestException.ofFunding("이미 참여한 펀딩입니다.");
        }
    }

}
