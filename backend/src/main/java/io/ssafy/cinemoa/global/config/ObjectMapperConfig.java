package io.ssafy.cinemoa.global.config;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * ObjectMapper 설정
 * 
 * JSON 직렬화/역직렬화에 사용되는 ObjectMapper의 전역 설정을 관리합니다.
 * - null 값 처리
 * - 알 수 없는 속성 처리
 * - 기타 JSON 처리 규칙
 */
@Configuration
public class ObjectMapperConfig {

  @Bean
  public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();

    // 1. null 값 처리 설정
    mapper.setSerializationInclusion(JsonInclude.Include.NON_NULL);

    // 2. 알 수 없는 속성 무시 (API 응답에 예상치 못한 필드가 있어도 에러 발생X)
    mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    return mapper;
  }
}
