package io.ssafy.cinemoa.external.text.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.cinemoa.external.text.config.TextApiConfig;
import io.ssafy.cinemoa.external.text.dto.ClaudeApiRequest;
import io.ssafy.cinemoa.external.text.dto.ClaudeApiResponse;
import io.ssafy.cinemoa.funding.dto.VideoContentRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * 텍스트 요약 API 클라이언트
 *
 * 외부 텍스트 요약 서비스와 통신하여 텍스트 요약을 처리합니다.
 * - 외부 텍스트 요약 API 호출 및 응답 처리
 * - 외부 API 응답을 프로젝트 내부 응답 형식으로 변환
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TextSummaryApiClient {

    private final RestTemplate restTemplate;
    private final TextApiConfig textApiConfig;
    private final ObjectMapper objectMapper;

    /**
     * 텍스트 요약 처리
     *
     * Claude API를 호출하여 텍스트를 요약합니다.
     *
     * @param request 비디오 콘텐츠 요청 객체
     * @return 요약된 텍스트
     */
    public String summarizeText(VideoContentRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            log.info("Claude API 호출 시작 - URL: {}, 원본길이: {}",
                    textApiConfig.getTextSummaryUrl(),
                    request.getVideoContent() != null ? request.getVideoContent().length() : 0);

            // 1. Claude API 요청 객체 생성
            ClaudeApiRequest claudeRequest = ClaudeApiRequest.createSummaryRequest(request.getVideoContent());

            // 2. 요청 헤더 설정
            HttpHeaders headers = createHeaders();

            // 3. 요청 본문 설정
            ResponseEntity<ClaudeApiResponse> response = null;

            // 4. 디버깅을 위한 요청 내용 로그
            try {
                String requestBody = objectMapper.writeValueAsString(claudeRequest);
                log.info("Claude API 요청 내용: {}", requestBody);

                // 5. API 호출
                response = restTemplate.postForEntity(
                        textApiConfig.getTextSummaryUrl(),
                        new HttpEntity<>(requestBody, headers),
                        ClaudeApiResponse.class);
            } catch (Exception e) {
                log.warn("요청 내용 로깅 실패: {}", e.getMessage());
            }

            // 6. 응답 처리
            if (response.getStatusCode().is2xxSuccessful()) {
                log.debug("Claude API 응답 성공 - 상태코드: {}", response.getStatusCode());
                ClaudeApiResponse result = response.getBody();
                long processingTime = System.currentTimeMillis() - startTime;

                // 응답 내용 로깅
                try {
                    String responseBody = objectMapper.writeValueAsString(result);
                    log.debug("Claude API 응답 내용: {}", responseBody);
                } catch (Exception e) {
                    log.warn("응답 내용 로깅 실패: {}", e.getMessage());
                }

                // 응답에 유효한 콘텐츠가 있는지 확인
                if (!result.hasValidContent()) {
                    log.warn("Claude API 응답에 유효한 콘텐츠가 없음 - ID: {}, StopReason: {}", result.getId(),
                            result.getStopReason());
                    return createErrorResponse("API 응답에 유효한 콘텐츠가 없음");
                }

                String summaryText = result.getSummaryText().replace("\"", "");

                log.info("■■■■■■■■ Claude API 요약 성공 - 원본길이: {}, 요약길이: {}, 처리시간: {}ms, 입력토큰: {}, 출력토큰: {} ■■■■■■■■",
                        request.getVideoContent() != null ? request.getVideoContent().length() : 0,
                        summaryText != null ? summaryText.length() : 0,
                        processingTime,
                        result.getUsage() != null ? result.getUsage().getInputTokens() : 0,
                        result.getUsage() != null ? result.getUsage().getOutputTokens() : 0);

                return summaryText;
            } else {
                log.warn("Claude API 응답 실패 - 상태코드: {}", response.getStatusCode());

                // 실패한 응답 내용도 로깅
                try {
                    if (response.getBody() != null) {
                        String responseBody = objectMapper.writeValueAsString(response.getBody());
                        log.debug("Claude API 실패 응답 내용: {}", responseBody);
                    }
                } catch (Exception e) {
                    log.warn("실패 응답 내용 로깅 실패: {}", e.getMessage());
                }

                return createErrorResponse("API 응답 실패: " + response.getStatusCode());
            }

        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("Claude API 호출 실패 - 처리시간: {}ms, 오류: {}", processingTime, e.getMessage(), e);
            return createErrorResponse("API 호출 실패: " + e.getMessage());
        }
    }

    /**
     * 요청 헤더 생성
     *
     * @return HTTP 요청 헤더
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        // Claude API 헤더 설정
        headers.set("x-api-key", textApiConfig.getApiKey());
        headers.set("anthropic-version", "2023-06-01");

        return headers;
    }

    /**
     * 오류 응답 생성
     *
     * API 호출 실패 또는 예외 상황에서 오류 메시지 반환
     *
     * @param errorMessage 상세 오류 메시지
     * @return 오류 메시지
     */
    private String createErrorResponse(String errorMessage) {
        return "텍스트 요약 처리 실패: " + errorMessage;
    }
}
