package io.ssafy.cinemoa.auth.controller;

import io.ssafy.cinemoa.auth.service.GoogleIdTokenDecoderService;
import io.ssafy.cinemoa.auth.dto.IdTokenVerifyRequest;
import io.ssafy.cinemoa.auth.dto.IdTokenClaims;
import io.ssafy.cinemoa.auth.dto.IdTokenVerifyResponse;
import lombok.RequiredArgsConstructor;                             // @RequiredArgsConstructor: 생성자 주입 자동 생성
import org.springframework.http.ResponseEntity;                   // ResponseEntity: 상태코드/바디 제어
import org.springframework.web.bind.annotation.*;                 // 웹 애너테이션 모음

@RestController // @RestController: JSON 반환 전용 컨트롤러(@Controller + @ResponseBody)
@RequestMapping("/auth/google") // @RequestMapping: 공통 URL prefix
@RequiredArgsConstructor // @RequiredArgsConstructor: final 필드 생성자 자동 생성
public class GoogleAuthController {

    private final GoogleIdTokenDecoderService idTokenService; // 서비스 의존성

    @PostMapping("/verify") // @PostMapping: POST /auth/google/verify 요청을 이 메서드로 매핑
    public ResponseEntity<IdTokenVerifyResponse> verify(@RequestBody IdTokenVerifyRequest req) {
        // @RequestBody: JSON 바디를 DTO로 역직렬화
        IdTokenClaims claims = idTokenService.verifyAndDecode(req.getIdToken()); // 서명검증 + 디코딩
        // (선택) 여기서 DB 사용자 조회/생성, 세션 생성 등을 이어붙이면 됨
        return ResponseEntity.ok(new IdTokenVerifyResponse(true, claims, "디코딩 완료")); // 200 OK
    }

    // ❗ 테스트/디버그 편의: 잘못된 토큰 등 검증 실패 시 400으로 내려주기
    @ExceptionHandler(IllegalArgumentException.class) // @ExceptionHandler: 특정 예외를 이 메서드로 처리
    public ResponseEntity<IdTokenVerifyResponse> handleBadRequest(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(new IdTokenVerifyResponse(false, null, e.getMessage()));
    }
}