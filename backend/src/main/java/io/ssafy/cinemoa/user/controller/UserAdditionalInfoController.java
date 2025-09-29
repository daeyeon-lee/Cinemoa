package io.ssafy.cinemoa.user.controller;

import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.user.dto.UserAdditionalInfoRequest;
import io.ssafy.cinemoa.user.service.UserAdditionalInfoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserAdditionalInfoController {

    private final UserAdditionalInfoService userAdditionalInfoService;

    /**
     * 특정 회원의 추가 정보(선호 카테고리, 계좌)를 등록합니다.
     */
    @PatchMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> addAdditionalInfo(
            @PathVariable("userId") Long userId,
            @RequestBody UserAdditionalInfoRequest request
    ) {
        // TODO: 사용자 권한 검증 로직 추가 (Spring Security 연동 시)
        // 현재는 임시로 주석 처리
        // Long currentUserId = getCurrentUserId(); // 현재 로그인한 사용자 ID 가져오기
        // if (!userId.equals(currentUserId)) {
        //     throw NoAuthorityException.ofUser();
        // }

        // 서비스 로직(추가 정보 등록) 호출
        userAdditionalInfoService.addAdditionalInfo(userId, request);

        // 성공 응답 반환 (API 명세서와 일치)
        return ResponseEntity.ok(ApiResponse.ofSuccess(null, "회원 추가 정보가 등록되었습니다."));
    }
}

