package io.ssafy.cinemoa.security.provider;

import io.jsonwebtoken.LocatorAdapter;
import io.jsonwebtoken.ProtectedHeader;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.security.dto.OIDCPublicKeysResponse;
import io.ssafy.cinemoa.security.dto.OIDCPublicKeysResponse.OIDCPublicKeyDto;
import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.math.BigInteger;
import java.security.Key;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.RSAPublicKeySpec;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class GooglePublicKeyProvider extends LocatorAdapter<Key> {

    private static final String CERT_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Pattern cachePattern = Pattern.compile("max-age\\s*=\\s*(\\d+)");
    private final RestTemplate restTemplate;
    private volatile Instant lastFetch = Instant.MIN;
    @Getter
    private volatile OIDCPublicKeysResponse publicKey;
    private volatile Duration cacheDuration = Duration.ofHours(6);

    @PostConstruct
    public void initKey() throws IOException {
        refreshCert();
    }

    @Scheduled(fixedRate = 30 * 60 * 1000)
    public void refreshCert() {

        if (shouldRefresh()) {
            refreshKeys();
        }
        RestTemplate restTemplate = new RestTemplate();

        publicKey = restTemplate.getForObject(CERT_URL, OIDCPublicKeysResponse.class);
    }

    private boolean shouldRefresh() {
        return publicKey == null || Instant.now().isAfter(lastFetch.plus(cacheDuration));
    }

    private void refreshKeys() {
        try {
            HttpHeaders httpHeaders = new HttpHeaders();
            HttpEntity<?> entity = new HttpEntity<>(httpHeaders);

            ResponseEntity<OIDCPublicKeysResponse> response = restTemplate.exchange(CERT_URL, HttpMethod.GET, entity,
                    OIDCPublicKeysResponse.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                this.publicKey = response.getBody();
                this.lastFetch = Instant.now();

                // Cache-Control 헤더에서 캐시 기간 추출
                String cacheControl = response.getHeaders().getCacheControl();

                if (cacheControl != null && cacheControl.contains("max-age=")) {
                    long maxAge = extractMaxAge(cacheControl);
                    this.cacheDuration = Duration.ofSeconds(maxAge);
                }

                Instant nextRefresh = lastFetch.plus(cacheDuration);
                ZonedDateTime kstTime = nextRefresh.atZone(ZoneId.of("Asia/Seoul"));

                log.info("OIDC 키 갱신 완료. 키 개수: {}, 다음 갱신: {} (KST)",
                        publicKey.getKeys().size(),
                        kstTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
            }
        } catch (Exception e) {
            log.error("구글 OIDC 키 갱신 실패");
        }
    }

    private long extractMaxAge(String cacheHeader) {
        Matcher matcher = cachePattern.matcher(cacheHeader);

        if (matcher.find()) {
            try {
                return Long.parseLong(matcher.group(1));
            } catch (NumberFormatException e) {
                log.warn("구글 Key cache max-age 파싱 실패.. {}", matcher.group(1));
            }
        }

        return 3600;
    }

    @Override
    protected Key locate(ProtectedHeader header) {
        for (OIDCPublicKeyDto dto : publicKey.getKeys()) {
            if (header.getKeyId().equals(dto.getKid())) {
                try {
                    return getRSAPublicKey(dto.getN(), dto.getE());
                } catch (NoSuchAlgorithmException | InvalidKeySpecException e) {
                    throw BadRequestException.ofInput("잘못된 토큰입니다.");
                }
            }
        }
        return null;
    }

    private PublicKey getRSAPublicKey(String modulus, String exponent)
            throws NoSuchAlgorithmException, InvalidKeySpecException {
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        byte[] decodeN = Base64.getUrlDecoder().decode(modulus);
        byte[] decodeE = Base64.getUrlDecoder().decode(exponent);
        BigInteger n = new BigInteger(1, decodeN);
        BigInteger e = new BigInteger(1, decodeE);

        RSAPublicKeySpec keySpec = new RSAPublicKeySpec(n, e);
        return keyFactory.generatePublic(keySpec);
    }
}
