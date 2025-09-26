package io.ssafy.cinemoa.external.text.dto;

import java.util.List;
import lombok.Data;

/**
 * OpenAI API 응답 DTO
 */
@Data
public class GPTApiResponse {

    private String id;
    private String object;
    private Long created;
    private String model;
    private List<Choice> choices;
    private Usage usage;
    private String system_fingerprint;

    @Data
    public static class Choice {
        private Integer index;
        private Message message;
        private Object logprobs; // nullable
        private String finish_reason;
    }

    @Data
    public static class Message {
        private String role;
        private String content;
    }

    @Data
    public static class Usage {
        private Integer prompt_tokens;
        private Integer completion_tokens;
        private Integer total_tokens;
    }

    /**
     * 요약된 텍스트 추출
     */
    public String getSummaryText() {
        if (choices != null && !choices.isEmpty() && choices.get(0) != null
                && choices.get(0).getMessage() != null) {
            String content = choices.get(0).getMessage().getContent();
            return content != null ? content.trim() : "";
        }
        return "";
    }

    /**
     * 응답 유효성 확인
     */
    public boolean hasValidContent() {
        return choices != null && !choices.isEmpty()
                && choices.get(0) != null
                && choices.get(0).getMessage() != null
                && getSummaryText() != null
                && !getSummaryText().isEmpty();
    }
}
