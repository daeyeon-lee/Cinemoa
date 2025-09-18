package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.favorite.service.FundingFavoriteService;
import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.dto.FundingCreationResult;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse;
import io.ssafy.cinemoa.funding.dto.FundingHoldRequest;
import io.ssafy.cinemoa.funding.dto.FundingLikeRequest;
import io.ssafy.cinemoa.funding.service.ExpiringFundingService;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.funding.service.RecommendedFundingListService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/funding")
public class FundingController {

    private final FundingService fundingService;
    private final FundingFavoriteService fundingFavoriteService;

    private final ExpiringFundingService expiringFundingService;
    private final RecommendedFundingListService recommendedFundingListService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createFunding(
            @RequestPart(name = "bannerImg", required = false) MultipartFile image
            , @RequestPart(name = "request") FundingCreateRequest request) {
        FundingCreationResult result = fundingService.createFunding(image, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    @GetMapping("/{fundingId}")
    public ResponseEntity<ApiResponse<?>> getFundingDetails(@PathVariable("fundingId") Long fundingId,
                                                            @RequestParam(value = "userId", required = false) Long userId) {
        FundingDetailResponse response = fundingService.getFundingDetail(fundingId, userId);

        return ResponseEntity.ok(ApiResponse.ofSuccess(response));
    }

    @PostMapping("/{fundingId}/like")
    public ResponseEntity<ApiResponse<?>> likeFunding(@PathVariable("fundingId") Long fundingId,
                                                      @RequestBody FundingLikeRequest request) {
        fundingFavoriteService.like(request.getUserId(), fundingId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }

    @DeleteMapping("/{fundingId}/like")
    public ResponseEntity<ApiResponse<?>> unlikeFunding(@PathVariable("fundingId") Long fundingId,
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

    @GetMapping("/expiring")
    public ResponseEntity<ApiResponse<?>> getExpiringFunding(
            @RequestParam(value = "userId", required = false) Long userId) {
        List<CardTypeFundingInfoDto> result = expiringFundingService.getExpiringFundings(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }

    @GetMapping("/recommended-funding")
    public ResponseEntity<ApiResponse<List<?>>> getRecommendedFundings(
            @RequestParam("userId") Long userId) {

        List<CardTypeFundingInfoDto> result = recommendedFundingListService.getRecommendedFundings(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));

    }

}
