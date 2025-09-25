package io.ssafy.cinemoa.external.text.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Claude API 요청 DTO
 *
 * Claude API에 메시지를 전송할 때 사용하는 요청 형식
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaudeApiRequest {

    private String model; // "claude-3-7-sonnet-latest"

    @JsonProperty("max_tokens")
    private Integer maxTokens; // 1024

    private List<Message> messages;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role; // "user"
        private String content; // 메시지 내용
    }

    /**
     * 텍스트 요약 요청 생성
     *
     * @param text 요약할 텍스트
     * @return Claude API 요청 객체
     */
    public static ClaudeApiRequest createSummaryRequest(String text) {
        String prompt = String.format(
                "다음은 상영물(영화/시리즈/공연/스포츠중계)의 상세 설명입니다. 아래 내용을 2-3줄로 요약해주세요. 만약 외국어일 경우 한국어로 번역한 다음 요약을 수행해 주세요. 요약 시 다음 사항을 준수해 주세요: - 핵심 내용과 매력 포인트를 포함- 불필요한 세부사항은 제외- 관객이 흥미를 느낄 수 있도록 작성 - 영화 소개 같이 생동감 있게 작성 - 딱딱한 문어체 피해줘. - ~입니다. ~있어요. 같은식으로 문장 끝내기 금지. [원본 텍스트]\n\n%s",
                text);

        Message message = Message.builder()
                .role("user")
                .content(prompt)
                .build();

        return ClaudeApiRequest.builder()
                .model("claude-3-7-sonnet-latest")
                .maxTokens(1024)
                .messages(List.of(message))
                .build();
    }
}
