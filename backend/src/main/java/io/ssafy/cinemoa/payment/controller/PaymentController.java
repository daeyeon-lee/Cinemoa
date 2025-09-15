package io.ssafy.cinemoa.payment.controller;

import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.payment.dto.FundingPaymentRequest;
import io.ssafy.cinemoa.payment.dto.FundingPaymentResponse;
import io.ssafy.cinemoa.payment.dto.FundingRefundRequest;
import io.ssafy.cinemoa.payment.dto.FundingRefundResponse;
import io.ssafy.cinemoa.payment.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/payment")
public class PaymentController {

    private final PaymentService paymentService;

    /* 펀딩 참여 (펀딩 참여금 결제) */
    @PostMapping
    public ResponseEntity<ApiResponse<?>> processFundingPayment(@Valid @RequestBody FundingPaymentRequest request) {
        // 향후 스프링 시큐리티 구현 후 추가
        // log.info("펀딩 결제 요청 - 사용자: {}, 펀딩ID: {}, 금액: {}", userDetails.getUsername(),
        // request.getFundingId(), request.getAmount());
        // Long userId = Long.valueOf(userDetails.getUsername());
        Long currentUserId = 1L;
        FundingPaymentResponse response = paymentService.processFundingPayment(currentUserId, request);

        return ResponseEntity.ok(ApiResponse.ofSuccess(response, "펀딩 참여 결제가 완료되었습니다."));
    }

    /* 펀딩 취소 (펀딩 참여금 환불) */
    @PostMapping("/refund")
    public ResponseEntity<ApiResponse<?>> processFundingRefund(@Valid @RequestBody FundingRefundRequest request) {
        // 향후 스프링 시큐리티 구현 후 추가
        // log.info("펀딩 환불 요청 - 사용자: {}, 펀딩ID: {}", userDetails.getUsername(),
        // request.getFundingId());
        // Long userId = Long.valueOf(userDetails.getUsername());
        Long currentUserId = 1L;

        FundingRefundResponse response = paymentService.processFundingRefund(currentUserId, request);

        return ResponseEntity.ok(ApiResponse.ofSuccess(response, "펀딩 참여금 환불이 완료되었습니다."));
    }

}
