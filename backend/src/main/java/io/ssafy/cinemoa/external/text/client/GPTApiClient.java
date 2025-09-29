package io.ssafy.cinemoa.external.text.client;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.ssafy.cinemoa.external.text.config.GPTApiConfig;
import io.ssafy.cinemoa.external.text.dto.GPTApiRequest;
import io.ssafy.cinemoa.external.text.dto.GPTApiResponse;
import io.ssafy.cinemoa.funding.dto.VideoContentRequest;
import io.ssafy.cinemoa.global.exception.InternalServerException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * OpenAI API 클라이언트
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GPTApiClient {

    private final RestTemplate restTemplate;
    private final GPTApiConfig gptApiConfig;
    private final ObjectMapper objectMapper;

    /**
     * 텍스트 요약 처리
     *
     * OpenAI GPT API를 호출하여 텍스트를 요약합니다.
     *
     * @param request 비디오 콘텐츠 요청 객체
     * @return 요약된 텍스트
     */
    public String summarizeText(VideoContentRequest request) {
        long startTime = System.currentTimeMillis();

        try {
            // 입력 검증
            if (request == null || request.getVideoContent() == null || request.getVideoContent().trim().isEmpty()) {
                log.warn("비디오 콘텐츠가 비어있습니다.");
                throw InternalServerException.ofSummarize();
            }

            log.info("OpenAI API 호출 시작 - URL: {}, 원본길이: {}",
                    gptApiConfig.getChatUrl(),
                    request.getVideoContent().length());

            GPTApiRequest openAiRequest = GPTApiRequest.createSummaryRequest(request.getVideoContent());

            // 2. 요청 헤더 설정
            HttpHeaders headers = createHeaders();

            // 3. API 호출
            ResponseEntity<GPTApiResponse> response = null;

            try {
                String requestBody = objectMapper.writeValueAsString(openAiRequest);
                log.info("OpenAI API 요청 내용: {}", requestBody);

                response = restTemplate.postForEntity(
                        gptApiConfig.getChatUrl(),
                        new HttpEntity<>(requestBody, headers),
                        GPTApiResponse.class);
            } catch (Exception e) {
                log.error("OpenAI API 호출 실패: {}", e.getMessage(), e);
                throw InternalServerException.ofSummarize();
            }

            // 4. 응답 처리
            if (response == null) {
                log.warn("OpenAI API 응답이 null입니다.");
                throw InternalServerException.ofSummarize();
            }

            log.info("OpenAI API 응답 상태코드: {}", response.getStatusCode());

            if (!response.getStatusCode().is2xxSuccessful()) {
                log.warn("OpenAI API HTTP 에러 - 상태코드: {}", response.getStatusCode());
                throw InternalServerException.ofSummarize();
            }

            GPTApiResponse result = response.getBody();

            if (result == null) {
                log.warn("OpenAI API 응답 본문이 null입니다.");
                throw InternalServerException.ofSummarize();
            }

            long processingTime = System.currentTimeMillis() - startTime;

            // 응답 내용 로깅
            try {
                String responseBody = objectMapper.writeValueAsString(result);
                log.debug("OpenAI API 응답 내용: {}", responseBody);
            } catch (Exception e) {
                log.warn("응답 내용 로깅 실패: {}", e.getMessage());
            }

            // 실제 응답 형식에 맞게 처리
            if (result.hasValidContent()) {
                String summaryText = result.getSummaryText();

                log.info(
                        "■■■■■■■■ OpenAI API 요약 성공 - 원본길이: {}, 요약길이: {}, 처리시간: {}ms, 입력토큰: {}, 출력토큰: {}, Model: {}, Finish Reason: {} ■■■■■■■■",
                        request.getVideoContent().length(),
                        summaryText != null ? summaryText.length() : 0,
                        processingTime,
                        getInputTokens(result),
                        getOutputTokens(result),
                        result.getModel(),
                        result.getChoices() != null && !result.getChoices().isEmpty()
                                ? result.getChoices().get(0).getFinish_reason()
                                : "unknown");

                return summaryText;
            } else {
                log.warn("OpenAI API 응답 실패 또는 유효하지 않은 콘텐츠 - hasValidContent: {}",
                        result.hasValidContent());
                throw InternalServerException.ofSummarize();
            }

        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - startTime;
            log.error("OpenAI API 호출 실패 - 처리시간: {}ms, 오류: {}", processingTime, e.getMessage(), e);
            throw InternalServerException.ofSummarize();
        }
    }

    /**
     * 요청 헤더 생성
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + gptApiConfig.getApiKey());

        return headers;
    }

    /**
     * 안전한 입력 토큰 수 가져오기
     */
    private Integer getInputTokens(GPTApiResponse result) {
        if (result.getUsage() != null && result.getUsage().getPrompt_tokens() != null) {
            return result.getUsage().getPrompt_tokens();
        }
        return 0;
    }

    /**
     * 안전한 출력 토큰 수 가져오기
     */
    private Integer getOutputTokens(GPTApiResponse result) {
        if (result.getUsage() != null && result.getUsage().getCompletion_tokens() != null) {
            return result.getUsage().getCompletion_tokens();
        }
        return 0;
    }
}
