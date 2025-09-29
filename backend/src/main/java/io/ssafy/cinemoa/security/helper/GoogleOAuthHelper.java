package io.ssafy.cinemoa.security.helper;

import io.ssafy.cinemoa.security.constants.GoogleOAuthInfoConstants;
import io.ssafy.cinemoa.security.dto.AnonymousUserInfo;
import io.ssafy.cinemoa.security.dto.OIDCDecodePayload;
import io.ssafy.cinemoa.security.provider.GooglePublicKeyProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class GoogleOAuthHelper {

    private final OAuthOIDCHelper oAuthOIDCHelper;
    private final GooglePublicKeyProvider publicKeyProvider;
    private final GoogleOAuthInfoConstants infoConstants;

    public AnonymousUserInfo getOAuthInfoByIdToken(String idToken) {
        OIDCDecodePayload oidcDecodePayload = getOIDCDecodePayload(idToken);
        return AnonymousUserInfo.builder()
                .email(oidcDecodePayload.getEmail())
                .picture(oidcDecodePayload.getPicture())
                .build();
    }

    public OIDCDecodePayload getOIDCDecodePayload(String token) {
        return oAuthOIDCHelper.getPayloadFromIdToken(
                token,
                infoConstants.getIss(),
                infoConstants.getClientIdList()
                , publicKeyProvider);
    }
}
