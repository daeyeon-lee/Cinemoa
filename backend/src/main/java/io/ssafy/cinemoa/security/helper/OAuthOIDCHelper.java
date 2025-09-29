package io.ssafy.cinemoa.security.helper;

import io.jsonwebtoken.Locator;
import io.ssafy.cinemoa.security.dto.OIDCDecodePayload;
import io.ssafy.cinemoa.security.provider.JwtOIDCProvider;
import java.security.Key;
import java.util.Collection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OAuthOIDCHelper {

    private final JwtOIDCProvider jwtOIDCProvider;

    public OIDCDecodePayload getPayloadFromIdToken(String token, Collection<String> iss, Collection<String> aud,
                                                   Locator<Key> keyLocator) {
        return jwtOIDCProvider.getOIDCTokenBody(token, iss, aud, keyLocator);
    }
}
