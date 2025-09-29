package io.ssafy.cinemoa.security.constants;

import java.util.List;
import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GoogleOAuthInfoConstants {
    @Getter
    private final List<String> iss = List.of("accounts.google.com", "https://accounts.google.com");

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String webClientId;

    public List<String> getClientIdList() {
        return List.of(webClientId);
    }
}
