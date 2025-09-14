package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.RefundAccountUpdateRequestDto;
import io.ssafy.cinemoa.user.service.RefundAccountUpdateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 환불계좌 변경을 위한 Controller
 */
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class RefundAccountUpdateController {

    private final RefundAccountUpdateService refundAccountUpdateService;

    /**
     * 환불계좌 정보 변경
     * @param userId 사용자 ID
     * @param requestDto 환불계좌 변경 요청 DTO
     * @return 변경 성공 응답
     */
    @PatchMapping("/{userId}/refund-account")
    public ResponseEntity<ApiResponse<Void>> updateRefundAccount(
            @PathVariable("userId") Long userId,
            @RequestBody RefundAccountUpdateRequestDto requestDto) {
        
        // Service를 통해 환불계좌 정보 업데이트
        refundAccountUpdateService.updateRefundAccount(userId, requestDto);
        
        // 성공 응답 반환 (data는 null)
        return ResponseEntity.ok(ApiResponse.ofSuccess(null, "변경 성공"));
    }
}
