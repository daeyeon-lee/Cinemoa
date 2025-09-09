package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.favorite.service.FundingFavoriteService;
import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.dto.FundingHoldRequest;
import io.ssafy.cinemoa.funding.dto.FundingLikeRequest;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/funding")
public class FundingController {


    private final FundingService fundingService;
    private final FundingFavoriteService fundingFavoriteService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createFunding(@RequestBody FundingCreateRequest request) {
        fundingService.createFunding(request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    @PostMapping("/{fundingId}/like")
    public ResponseEntity<ApiResponse<?>> likeFunding(@PathVariable("fundingId") Long fundingId,
                                                      @RequestBody FundingLikeRequest request) {
        fundingFavoriteService.like(request.getUserId(), fundingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    @DeleteMapping("/{fundingId}/like")
    public ResponseEntity<ApiResponse<?>> likeFunding(@PathVariable("fundingId") Long fundingId,
                                                      @RequestParam Long userId) {
        fundingFavoriteService.unlike(userId, fundingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    @PostMapping("/{fundingId}/hold")
    public ResponseEntity<ApiResponse<?>> holdSeatOfFunding(@PathVariable("fundingId") Long fundingId,
                                                            @RequestBody FundingHoldRequest request) {
        fundingService.holdSeatOf(request.getUserId(), fundingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null, "좌석 획득 성공"));
    }

    @DeleteMapping("/{fundingId}/hold")
    public ResponseEntity<ApiResponse<?>> unholdSeatOfFunding(@PathVariable("fundingId") Long fundingId,
                                                              @RequestParam Long userId) {
        fundingService.unholdSeatOf(userId, fundingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null, "좌석 획득 해제 성공"));
    }

}
