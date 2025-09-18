package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.VoteCreateRequest;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vote")
public class VoteController {

    private final FundingService fundingService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createVote(
            @RequestPart(name = "bannerImg", required = false) MultipartFile image
            , @RequestPart(name = "request") VoteCreateRequest request) {
        fundingService.createVote(image, request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }
}
