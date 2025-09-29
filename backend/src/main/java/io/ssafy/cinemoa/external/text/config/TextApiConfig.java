package io.ssafy.cinemoa.external.text.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Getter
public class TextApiConfig {

    @Value("${gms.api.base-url}")
    private String baseUrl;

    @Value("${gms.api.key}")
    private String apiKey;

    // 텍스트 처리 LLM 모델
    public String getTextSummaryUrl() {
        return baseUrl + "/messages";
    }

}