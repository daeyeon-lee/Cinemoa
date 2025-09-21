package io.ssafy.cinemoa.user.service;

import java.util.List;
import java.util.Arrays;
import java.util.Random;
import org.springframework.stereotype.Component;

/**
 * 영화관 대관 및 투표 서비스에 어울리는 랜덤 닉네임을 생성하는 클래스
 */
@Component
public class MovieNicknameGenerator {

    // 닉네임 앞부분에 사용될 영화/영화관 관련 형용사 목록
    private static final List<String> ADJECTIVES = Arrays.asList(
            "팝콘을 든", "스크린을 응시하는", "N차 관람중인", "과몰입한",
            "엔딩크레딧을 기다리는", "명대사를 외우는", "조조영화를 본",
            "펀딩에 성공한", "투표를 마친", "숨은 명작을 찾는"
    );

    // 닉네임 뒷부분에 사용될 영화 관련 명사 목록
    private static final List<String> NOUNS = Arrays.asList(
            "주인공", "빌런", "관람객", "히어로", "요정", "마법사", 
            "탐정", "능력자", "여행자", "후원자", "몽상가", "모험가"
    );

    private final Random random = new Random();

    /**
     * 형용사와 명사를 조합하여 랜덤 닉네임을 생성합니다.
     * @return 생성된 랜덤 닉네임 (예: "과몰입한 몽상가")
     */
    public String generate() {
        String adjective = ADJECTIVES.get(random.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(random.nextInt(NOUNS.size()));
        return String.format("%s %s", adjective, noun);
    }
}
