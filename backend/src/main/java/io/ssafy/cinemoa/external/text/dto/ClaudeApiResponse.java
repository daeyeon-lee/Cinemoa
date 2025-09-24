package io.ssafy.cinemoa.external.text.dto;

import lombok.Data;

import java.util.List;

/**
 * Claude API 응답 DTO
 * 
 * Claude API로부터 받는 응답 형식
 */
@Data
public class ClaudeApiResponse {

    private String id;
    private String type;
    private String role;
    private String model;
    private List<Content> content;
    private String stopReason;
    private String stopSequence;
    private Usage usage;

    @Data
    public static class Content {
        private String type; // "text"
        private String text; // 실제 텍스트 내용
    }

    @Data
    public static class Usage {
        private Integer inputTokens;
        private Integer outputTokens;
        private Integer cacheCreationInputTokens;
        private Integer cacheReadInputTokens;
        private CacheCreation cacheCreation;
        private String serviceTier;

        @Data
        public static class CacheCreation {
            private Integer ephemeral5mInputTokens;
            private Integer ephemeral1hInputTokens;
        }
    }

    /**
     * 응답에서 요약된 텍스트 추출
     * 
     * @return 요약된 텍스트 (첫 번째 content의 text)
     */
    public String getSummaryText() {
        if (content != null && !content.isEmpty() && content.get(0) != null) {
            return content.get(0).getText();
        }
        return null;
    }

    /**
     * 성공 여부 확인
     * 
     * @return 성공 시 true, 실패 시 false
     */
    public boolean isSuccess() {
        return id != null && content != null && !content.isEmpty();
    }
}
