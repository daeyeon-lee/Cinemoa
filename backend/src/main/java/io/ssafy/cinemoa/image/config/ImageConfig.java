package io.ssafy.cinemoa.image.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "image.api")
public class ImageConfig {

    private String base = "C:\\cinemoa";
}
