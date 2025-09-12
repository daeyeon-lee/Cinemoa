package io.ssafy.cinemoa.payment.controller;

import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.payment.dto.FundingPaymentRequest;
import io.ssafy.cinemoa.payment.dto.FundingPaymentResponse;
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

    @PostMapping
    public ResponseEntity<ApiResponse<?>> processFundingPayment(@Valid @RequestBody FundingPaymentRequest request) {
        // 향후 스프링 시큐리티 구현 후 추가
        // log.info("펀딩 결제 요청 - 사용자: {}, 펀딩ID: {}, 금액: {}", userDetails.getUsername(),
        // request.getFundingId(), request.getAmount());
        // Long userId = Long.valueOf(userDetails.getUsername());
        Long userId = 1L;
        FundingPaymentResponse response = paymentService.processFundingPayment(userId, request);

        return ResponseEntity.ok(ApiResponse.ofSuccess(response));
    }

    // 펀딩금 환불
    // @PostMapping("/{fundingId}/hold")
    // public ResponseEntity<ApiResponse<?>>
    // holdSeatOfFunding(@PathVariable("/fundingId") Long fundingId,
    // @RequestBody FundingHoldRequest request) {
    // paymentService.holdSeatOf(request.getUserId(), fundingId);
    // return ResponseEntity.ok(ApiResponse.ofSuccess(null, "좌석 획득 성공"));
    // }

}
