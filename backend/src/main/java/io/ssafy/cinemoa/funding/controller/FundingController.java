package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.favorite.service.FundingFavoriteService;
import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.FundingCreateRequest;
import io.ssafy.cinemoa.funding.dto.FundingCreationResult;
import io.ssafy.cinemoa.funding.dto.FundingDetailResponse;
import io.ssafy.cinemoa.funding.dto.FundingHoldRequest;
import io.ssafy.cinemoa.funding.dto.FundingLikeRequest;
import io.ssafy.cinemoa.funding.dto.VideoContentRequest;
import io.ssafy.cinemoa.funding.dto.VideoContentResult;
import io.ssafy.cinemoa.funding.service.ExpiringFundingService;
import io.ssafy.cinemoa.funding.service.FundingService;
import io.ssafy.cinemoa.funding.service.PopularFundingService;
import io.ssafy.cinemoa.funding.service.RecommendedFundingListService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/funding")
public class FundingController {

    private final FundingService fundingService;
    private final FundingFavoriteService fundingFavoriteService;

    private final ExpiringFundingService expiringFundingService;
    private final RecommendedFundingListService recommendedFundingListService;
    private final PopularFundingService popularFundingService;

    @PostMapping
    public ResponseEntity<ApiResponse<?>> createFunding(
            @RequestPart(value = "bannerImg", required = false) MultipartFile image,
            @RequestPart(value = "request") FundingCreateRequest request) {
        // 요청 데이터 로깅
        log.info("=== POST /api/funding Request Received ===");
        log.info("Image file: {}", image != null ? image.getOriginalFilename() : "null");
        log.info("Image size: {}", image != null ? image.getSize() : "0");
        log.info("Image content type: {}", image != null ? image.getContentType() : "null");
        log.info("FundingCreateRequest: {}", request);
        log.info("====================================");
        FundingCreationResult result = fundingService.createFunding(image, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ofSuccess(result));
    }

    @PostMapping("/{fundingId}/convert-to-funding")
    public ResponseEntity<ApiResponse<?>> convertToFunding(
            @PathVariable("fundingId") Long fundingId,
            @RequestBody FundingCreateRequest request) {

        FundingCreationResult result = fundingService.convertToFunding(fundingId, request);
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

    @GetMapping("/recommendation")
    public ResponseEntity<ApiResponse<List<?>>> getRecommendedFundings(
            @RequestParam(value = "userId", required = false) Long userId) {

        List<CardTypeFundingInfoDto> result = recommendedFundingListService.getRecommendedFundings(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<List<?>>> getFundingList(
            @RequestParam("ids") String ids,
            @RequestParam(value = "userId", required = false) Long userId) {

        List<Long> fundingIds = Arrays.stream(ids.split(","))
                .map(String::trim)
                .map(Long::parseLong)
                .collect(Collectors.toList());

        List<CardTypeFundingInfoDto> result = fundingService.getFundingList(fundingIds, userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<?>>> getPopularFundings(
            @RequestParam(value = "userId", required = false) Long userId) {

        List<CardTypeFundingInfoDto> result = popularFundingService.getTopPopularFundings(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }

    @PostMapping("/video-content")
    public ResponseEntity<ApiResponse<?>> processVideoContent(
            @RequestBody VideoContentRequest request) {
        VideoContentResult result = fundingService.processVideoContent(request);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "처리 완료"));
    }

}
