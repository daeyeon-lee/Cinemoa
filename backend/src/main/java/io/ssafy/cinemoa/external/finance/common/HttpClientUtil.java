package io.ssafy.cinemoa.external.finance.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.cinemoa.external.finance.dto.BaseApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 외부 API 호출을 위한 공통 유틸리티
 * 
 * - 요청/응답 로깅 기능 포함
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class HttpClientUtil {

  private final RestTemplate restTemplate;
  private final ObjectMapper objectMapper;

  /**
   * 외부 API 호출 (GET)
   * 
   * @param url          API URL
   * @param responseType 응답 타입
   * @param apiName      API 이름 (로깅용)
   * @return API 응답
   */
  public <T> BaseApiResponse<T> get(String url,
      ParameterizedTypeReference<BaseApiResponse<T>> responseType,
      String apiName) {

    // 요청 헤더 설정
    HttpHeaders headers = createHeaders();
    HttpEntity<Void> entity = new HttpEntity<>(headers);

    // 요청 로깅
    logApiRequest(url, HttpMethod.GET, headers, null, apiName);

    try {
      // API 호출
      ResponseEntity<BaseApiResponse<T>> response = restTemplate.exchange(
          url,
          HttpMethod.GET,
          entity,
          responseType);

      // 응답 로깅
      logApiResponse(response, apiName);

      return response.getBody();

    } catch (Exception e) {
      log.error("API 호출 실패 - {}: {}", apiName, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * 외부 API 호출 (POST)
   * 
   * @param url          API URL
   * @param requestBody  요청 본문
   * @param responseType 응답 타입
   * @param apiName      API 이름 (로깅용)
   * @return API 응답
   */
  public <T> BaseApiResponse<T> post(String url, Object requestBody,
      ParameterizedTypeReference<BaseApiResponse<T>> responseType,
      String apiName) {

    // 요청 헤더 설정
    HttpHeaders headers = createHeaders();
    HttpEntity<Object> entity = new HttpEntity<>(requestBody, headers);

    // 요청 로깅
    logApiRequest(url, HttpMethod.POST, headers, requestBody, apiName);

    try {
      // API 호출
      ResponseEntity<BaseApiResponse<T>> response = restTemplate.exchange(
          url,
          HttpMethod.POST,
          entity,
          responseType);

      // 응답 로깅
      logApiResponse(response, apiName);

      return response.getBody();

    } catch (Exception e) {
      log.error("API 호출 실패 - {}: {}", apiName, e.getMessage(), e);
      throw e;
    }
  }

  /**
   * 공통 헤더 생성
   */
  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.set("Accept", "application/json");
    return headers;
  }

  /**
   * API 요청 로깅
   */
  private void logApiRequest(String url, HttpMethod method, HttpHeaders headers,
      Object requestBody, String apiName) {
    try {
      log.info("=== {} API 요청 정보 ===", apiName);
      log.info("요청 URL: {}", url);
      log.info("요청 Method: {}", method);
      log.info("요청 Headers: {}", headers);

      if (requestBody != null) {
        String requestBodyJson = objectMapper.writeValueAsString(requestBody);
        log.info("요청 Body (JSON): {}", requestBodyJson);
      } else {
        log.info("요청 Body: null");
      }

      log.info("요청 시간: {}", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

    } catch (Exception e) {
      log.warn("요청 로깅 중 오류 발생: {}", e.getMessage());
    }
  }

  /**
   * API 응답 로깅
   */
  private <T> void logApiResponse(ResponseEntity<BaseApiResponse<T>> response, String apiName) {
    try {
      log.info("=== {} API 응답 정보 ===", apiName);
      log.info("HTTP Status: {}", response.getStatusCode());
      // log.info("응답 Headers: {}", response.getHeaders());

      BaseApiResponse<T> responseBody = response.getBody();
      if (responseBody != null) {
        String responseBodyJson = objectMapper.writeValueAsString(responseBody);
        log.info("응답 Body (JSON): {}", responseBodyJson);

        // Header 정보 상세 로깅
        if (responseBody.getHeader() != null) {

          log.info("API 응답 Header: {}", responseBody.getHeader());
        }

        // REC 데이터 상세 로깅
        // if (responseBody.getRec() != null) {
        // String recDataJson = objectMapper.writeValueAsString(responseBody.getRec());
        // log.info("REC 데이터 (JSON): {}", recDataJson);
        // }

      } else {
        log.info("응답 Body: null");
      }

      log.info("응답 시간: {}", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));

    } catch (Exception e) {
      log.warn("응답 로깅 중 오류 발생: {}", e.getMessage());
    }
  }
}
