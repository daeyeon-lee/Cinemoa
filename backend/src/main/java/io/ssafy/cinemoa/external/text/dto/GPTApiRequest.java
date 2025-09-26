package io.ssafy.cinemoa.external.text.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * OpenAI API 요청 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GPTApiRequest {
 
    private String model;
    private List<Message> messages;
    private Double temperature;
    private Integer max_tokens;
    private Double top_p;
    private Integer frequency_penalty;
    private Integer presence_penalty;
    private Boolean stream;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Message {
        private String role; // "system", "user", "assistant"
        private String content;
    }

    /**
     * 텍스트 요약 요청 생성
     */
    public static GPTApiRequest createSummaryRequest(String text) {

        String prompt = String.format(
                // "다음은 상영물(영화/시리즈/공연/스포츠중계)의 상세 설명입니다. 아래 내용을 2-3줄로 요약해주세요. 만약 외국어일 경우 한국어로 번역한 다음 요약을 수행해 주세요. 요약 시 다음 사항을 준수해 주세요: - 핵심 내용과 매력 포인트를 포함- 불필요한 세부사항은 제외- 관객이 흥미를 느낄 수 있도록 작성 - 영화 소개 같이 생동감 있게 작성 - 딱딱한 문어체 피해줘. - ~입니다. ~있어요. ~야. ~어. 같은식으로 문장 끝내기 금지. 반말 절대 하지마. 상영물 제목을 다시 언급하는거 금지.  [원본 텍스트]\n\n%s",
                "당신은 영화 상세 설명을 요약하는 전문가입니다. 중요 제약 조건:"
                        + "                        - 다음은 상영물(영화/시리즈/공연/스포츠중계)의 상세 설명입니다. 아래 내용을 2-3줄로 요약해주세요."
                        + "                        - 만약 외국어일 경우 한국어로 번역한 다음, 요약을 수행해 주세요."
                        + "                        - 핵심 내용과 매력 포인트를 포함, 불필요한 세부사항은 제외"
                        + "                        - 관객이 흥미를 느낄 수 있도록 작성 - 영화 소개 같이 생동감 있게 작성 "
                        + "                        - 딱딱한 문어체 피해줘. - ~입니다. ~있어요. ~야. ~어. 같은식으로 문장 끝내기 금지"
                        + "                        - 반말 절대 하지마. 상영물 제목을 다시 언급하는거 금지",
                text);

        return GPTApiRequest.builder()
                .model("gpt-4o")
                .messages(List.of(
                        Message.builder()
                                .role("user")
                                .content(prompt)
                                .build()))
                .temperature(1.0)
                .max_tokens(256)
                .top_p(1.0)
                .frequency_penalty(0)
                .presence_penalty(0)
                .stream(false)
                .build();
    }
}
