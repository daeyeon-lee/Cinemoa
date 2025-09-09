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

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserResponseDto>> getUserInfo(@PathVariable("userId") Long userId) {
        UserResponseDto result = userService.getUserInfo(userId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result, "조회 성공"));
    }
}
