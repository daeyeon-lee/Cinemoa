package io.ssafy.cinemoa.auth.service;

import com.nimbusds.jose.JWSAlgorithm;                       // RS256 알고리즘 상수
import com.nimbusds.jose.jwk.source.RemoteJWKSet;            // 구글 공개키(JWKS) 원격 소스
import com.nimbusds.jose.proc.JWSKeySelector;                // 서명 검증용 키 선택자
import com.nimbusds.jose.proc.JWSVerificationKeySelector;    // RS256 검증자
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;                        // 클레임 객체
import com.nimbusds.jwt.SignedJWT;                           // 서명된 JWT
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;            // JWT 처리기
import io.ssafy.cinemoa.auth.dto.IdTokenClaims;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Value;    // @Value: 설정값 주입
import org.springframework.stereotype.Service;                 // @Service: 서비스 레이어 컴포넌트
import org.springframework.util.StringUtils;

import java.net.URL;
import java.time.Instant;
import java.util.Date;
import java.util.List;

@Service // @Service: 비즈니스 로직 컴포넌트로 등록
public class GoogleIdTokenDecoderService {

    @Value("${google.client-id}") // @Value: application.yml의 google.client-id 값을 주입
    private String clientId;

    // 구글 OIDC 공개키(JWKS) 엔드포인트
    private static final String GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs";

    // 허용 발급자(iss)
    private static final List<String> ALLOWED_ISS =
            List.of("https://accounts.google.com", "accounts.google.com");

    /**
     * (1) 서명 검증: 토큰이 구글이 서명한 것이 맞는지 확인
     * (2) 디코딩: 안전하게 클레임을 꺼내 사용
     */
    public IdTokenClaims verifyAndDecode(String idToken) {
        // 0) idToken 들어왔는지 아닌지 확인
        if (!StringUtils.hasText(idToken)) {
//            throw BadRequestException.of("id_token 누락");
            throw BadRequestException.ofGoogleAuth();
        }

        // 1) 문자열 JWT → 파싱 (여기서 ParseException 발생 가능)
        SignedJWT signed;
        try {
            signed = SignedJWT.parse(idToken);
        } catch (java.text.ParseException e) {
            // 파싱 실패 → 잘못된 토큰 형식
            throw BadRequestException.ofGoogleAuth();
        }

        // 2) 구글 공개키(JWKS)로 서명 검증 + 클레임 추출
        JWTClaimsSet claims = processAndExtractClaims(signed);

        // 3) 필수 클레임 검증 (iss / aud / exp)
        validateIssuer(claims);
        validateAudience(claims);
        validateExpiry(claims);

        // 4) 필요한 값만 DTO로 매핑
        return toIdTokenClaims(claims);
    }

    /** 구글 JWKS 기반 서명 검증 + 클레임 추출 */
    @SneakyThrows // JOSEException 같은 checked 예외를 런타임으로 전파
    private JWTClaimsSet processAndExtractClaims(SignedJWT signed) {
        RemoteJWKSet<SecurityContext> jwkSet = new RemoteJWKSet<>(new URL(GOOGLE_JWKS_URI));
        JWSKeySelector<SecurityContext> keySelector =
                new JWSVerificationKeySelector<>(JWSAlgorithm.RS256, jwkSet);

        ConfigurableJWTProcessor<SecurityContext> processor = new DefaultJWTProcessor<>();
        processor.setJWSKeySelector(keySelector);

        return processor.process(signed, null); // 서명 검증 + 클레임 추출
    }

    private void validateIssuer(JWTClaimsSet claims) {
        String iss = claims.getIssuer();
        if (!ALLOWED_ISS.contains(iss)) {
//            throw BadRequestException.of("잘못된 발급자(iss): " + iss);
            throw BadRequestException.ofGoogleAuth();
        }
    }

    private void validateAudience(JWTClaimsSet claims) {
        List<String> aud = claims.getAudience();
        if (aud == null || !aud.contains(clientId)) {
//            throw BadRequestException.of("aud 불일치(등록한 google.client-id와 다름)");
            throw BadRequestException.ofGoogleAuth();
        }
    }

    private void validateExpiry(JWTClaimsSet claims) {
        Date exp = claims.getExpirationTime();
        if (exp == null || Instant.now().isAfter(exp.toInstant())) {
//            throw BadRequestException.of("토큰 만료(exp)");
            throw BadRequestException.ofGoogleAuth();
        }
    }

    private IdTokenClaims toIdTokenClaims(JWTClaimsSet claims) {
        String email;
        String name;
        String picture;

        try {
            email = claims.getStringClaim("email");
            name = claims.getStringClaim("name");
            picture = claims.getStringClaim("picture");
        } catch (java.text.ParseException e) {
//            throw BadRequestException.of("토큰 클레임 파싱 실패");
            throw BadRequestException.ofGoogleAuth();
        }

        if (!StringUtils.hasText(email)) {
//            throw BadRequestException.of("토큰에 email 클레임이 없습니다.");
            throw BadRequestException.ofGoogleAuth();
        }

        return new IdTokenClaims(email, name, picture);
    }
}
