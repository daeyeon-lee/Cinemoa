package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/funding")
public class FundingController {


    private final FundingService fundingService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createFunding(@RequestBody FundingCreateRequest request) {
        fundingService.create(request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

}
