package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.user.dto.UserResponseDto;
import io.ssafy.cinemoa.user.service.UserService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import io.ssafy.cinemoa.user.dto.RefundAccountResponseDto;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    /**
     * 특정 회원의 정보 조회(닉네임, 프로필 이미지 정보)
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserInfo(@PathVariable("userId") Long userId) {
        UserResponseDto result = userService.getUserInfo(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }

    /**
     * 특정 회원의 환불 계좌 정보 조회
     * * @param userId 조회할 사용자의 ID
     * 
     * @return 환불 계좌 정보
     */
    @GetMapping("/{userId}/refund-account")
    public ResponseEntity<ApiResponse<RefundAccountResponseDto>> getRefundAccount(@PathVariable("userId") Long userId) {
        // 1. UserService 호출해 환불 계좌 정보 조회
        RefundAccountResponseDto result = userService.getRefundAccount(userId);
        // RefundAccountResponseDto result = new RefundAccountResponseDto(
        //         1L, // userId
        //         new RefundAccountDto( // refundAccount (객체로 채워짐)
        //                 "110123456789", // accountNo
        //                 "국민은행", // bankName
        //                 "004" // bankCode
        //         ),
        //         null // message (이 경우는 null)
        // );
        // RefundAccountResponseDto result = new RefundAccountResponseDto(
        //         1L, // userId
        //         null, // refundAccount (null로 채워짐)
        //         "환불계좌를 등록해주세요." // message
        // );

        // 2. 환불 계좌 존재 여부에 따라 응답 메시지 변경
        String message = result.getRefundAccount() != null ? "환불계좌 정보를 조회했습니다." : "등록된 환불계좌가 없습니다.";

        // 3. 표준화된 성공 응답 형식으로 환불 계좌 정보 반환
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, message));
    }
}
