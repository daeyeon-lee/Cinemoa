package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.dto.VoteCreateRequest;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.funding.service.SearchService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/vote")
public class VoteController {

    private final FundingService fundingService;
    private final SearchService searchService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createVote(@RequestBody VoteCreateRequest request) {
        fundingService.createVote(request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> searchVote(@ModelAttribute SearchRequest request,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.ofSuccess(searchService.searchFunding(request, pageable)));
    }
}
