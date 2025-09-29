package io.ssafy.cinemoa.security.provider;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.Locator;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.security.dto.OIDCDecodePayload;
import java.security.Key;
import java.util.Collection;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;


@Slf4j
@Component
public class JwtOIDCProvider {

    public OIDCDecodePayload getOIDCTokenBody(String token, Collection<String> iss, Collection<String> aud,
                                              Locator<Key> keyLocator) {
        Claims body = getOIDCTokenJws(token, keyLocator).getPayload();
        
        if (!iss.contains(body.getIssuer()) || !aud.containsAll(body.getAudience())) {
            throw BadRequestException.ofInput("유효하지 않은 토큰");
        }

        return new OIDCDecodePayload(
                body.getIssuer(),
                body.getAudience(),
                body.getExpiration(),
                body.get("picture", String.class),
                body.get("email", String.class));
    }

    public Jws<Claims> getOIDCTokenJws(String token, Locator<Key> keyLocator) {
        try {
            return Jwts.parser()
                    .keyLocator(keyLocator)
                    .build()
                    .parseSignedClaims(token);
        } catch (Exception e) {
            log.warn("키 파싱에 실패하였음.");
            throw e;
        }
    }
}
