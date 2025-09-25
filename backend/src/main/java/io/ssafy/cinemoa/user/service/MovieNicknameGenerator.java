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
            "눈물 훔치는", "스포 당한", "팝콘 리필한", "N차 뛰는",
            "여운에 젖은", "최애를 만난", "떡밥을 푸는",
            "광고 스킵한", "엔딩 속", "흐물흐물한");

    // 닉네임 뒷부분에 사용될 영화 관련 명사 목록
    private static final List<String> NOUNS = Arrays.asList(
            "주인공", "빌런", "관람객", "히어로", "요정", "마법사",
            "탐정", "능력자", "여행자", "후원자", "몽상가", "모험가");

    private final Random random = new Random();

    /**
     * 형용사와 명사를 조합하여 랜덤 닉네임을 생성합니다.
     * 
     * @return 생성된 랜덤 닉네임 (예: "과몰입한 몽상가")
     */
    public String generate() {
        String adjective = ADJECTIVES.get(random.nextInt(ADJECTIVES.size()));
        String noun = NOUNS.get(random.nextInt(NOUNS.size()));
        return String.format("%s %s", adjective, noun);
    }
}
