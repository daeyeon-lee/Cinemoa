package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.VoteCreateRequest;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vote")
public class VoteController {

    private final FundingService fundingService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createVote(
            @RequestPart(value = "bannerImg", required = false) MultipartFile image,
            @RequestPart(value = "request") VoteCreateRequest request) {

        // 요청 데이터 로깅
        log.info("=== POST /api/vote Request Received ===");
        log.info("Image file: {}", image != null ? image.getOriginalFilename() : "null");
        log.info("Image size: {}", image != null ? image.getSize() : "0");
        log.info("Image content type: {}", image != null ? image.getContentType() : "null");
        log.info("VoteCreateRequest: {}", request);
        log.info("====================================");

        fundingService.createVote(image, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }
}
