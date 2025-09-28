package io.ssafy.cinemoa.external.text.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class GPTApiConfig {

    @Value("${gpt.api.base-url}")
    private String baseUrl;

    @Value("${gpt.api.key}")
    private String apiKey;

    @Value("${gpt.api.model}")
    private String model;

    /**
     * ChatGPT API URL 가져오기
     */
    public String getChatUrl() {
        return baseUrl + "/chat/completions";
    }
}
