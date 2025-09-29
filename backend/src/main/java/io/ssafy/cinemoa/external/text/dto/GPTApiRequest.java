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
                // "다음은 상영물(영화/시리즈/공연/스포츠중계)의 상세 설명입니다. 아래 내용을 2-3줄로 요약해주세요. 만약 외국어일 경우 한국어로 번역한
                // 다음 요약을 수행해 주세요. 요약 시 다음 사항을 준수해 주세요: - 핵심 내용과 매력 포인트를 포함- 불필요한 세부사항은 제외- 관객이
                // 흥미를 느낄 수 있도록 작성 - 영화 소개 같이 생동감 있게 작성 - 딱딱한 문어체 피해줘. - ~입니다. ~있어요. ~야. ~어.
                // 같은식으로 문장 끝내기 금지. 반말 절대 하지마. 상영물 제목을 다시 언급하는거 금지. [원본 텍스트]\n\n%s",
                // "이전의 대화 내용 다 무시하고 대답해줘. " +
                //         "당신은 영화 상세 설명을 정중한 한국어로 요약하는 요약 전문가입니다. 반드시 중요 제약 조건:"
                //         + "- 아래에 적힌 항목 **전부 반드시 준수**하여야 하며, **하나라도 누락되면 안 됩니다.**"
                //
                //         + "                        - 다음은 상영물(영화/시리즈/공연/스포츠중계)의 상세 설명입니다. 아래 내용을 2-3줄로 요약해주세요."
                //         + "                        - 만약 외국어일 경우 한국어로 번역한 다음, 요약을 수행해 주세요."
                //         + "                        - 핵심 내용과 매력 포인트를 포함, 불필요한 세부사항은 제외"
                //         + "                        - 관객이 흥미를 느낄 수 있도록 작성 - 영화 소개 같이 생동감 있게 작성 "
                //         + "                        - 딱딱한 문어체 피해줘. - ~입니다. ~있어요. ~야. ~어. 같은식으로 문장 끝내기 금지"
                //         + "                        - 반말 절대 하지마. 상영물 제목을 다시 언급하는거 금지",

                "이전의 대화 내용은 무시하고 대답해줘\n" +
                        "당신은 영화 소개 전문 작가입니다.\n"
                        + "아래에 제공되는 영화 상세 소개를 요약해 주십시오.  \n"
                        + "\n"
                        + "조건:  \n"
                        + "\n"
                        + "1. 입력 텍스트는 한국어와 영어가 혼합되어 있을 수 있으나, 결과물은 반드시 한국어로만 작성합니다.\n"
                        + "2. 반드시 원문이 사용하는 말투와 어미를 그대로 따라야 합니다.\n"
                        + "- 원문이 “~한다 / ~하게 된다”라면 요약도 “~한다 / ~하게 된다”로 작성합니다.\n"
                        + "- 원문이 “~있다 / ~린다 / ~된다”라면 요약도 “~있다 / ~린다 / ~된다”로 작성합니다.\n"
                        + "- 원문이 “~습니다 / ~합니다”라면 요약도 “~습니다 / ~합니다”로 작성합니다.\n"
                        + "- 원문이 다른 형식이라면 그 형식을 그대로 유지합니다.\n"
                        + "3. 원문과 다른 말투로 바꿔 쓰면 안 됩니다. "
                        + "4. 말투, 어미, 어조는 반드시 원문과 일치해야 합니다.\n"
                        + "[영화 상세 소개 원문]" +
                        text);

        return GPTApiRequest.builder()
                .model("gpt-4o")
                .messages(List.of(
                        Message.builder()
                                .role("user")
                                .content(prompt)
                                .build()))
                .temperature(0.3)
                .max_tokens(256)
                .top_p(1.0)
                .frequency_penalty(0)
                .presence_penalty(0)
                .stream(false)
                .build();
    }
}
