package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.repository.RecommendedFundingRepository;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.user.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 추천 펀딩 목록 조회를 위한 Service 클래스
 * <p>
 * 주요 기능: - 사용자별 추천 펀딩/투표 목록 조회 - 무한 스크롤 방식의 커서 기반 페이지네이션 - 타입별 필터링 (funding, vote, all) - 성공 가능성 기반 추천 점수 계산
 * <p>
 */
@Service
@RequiredArgsConstructor
public class RecommendedFundingListService {

    // Repository 의존성 주입
    private final UserRepository userRepository; // 사용자 정보 조회
    private final RecommendedFundingRepository recommendedFundingRepository; // 추천 펀딩 데이터 조회

    /**
     * 특정 사용자에게 추천할 펀딩/투표 목록을 조회합니다.
     *
     * @param userId 조회할 사용자의 ID
     * @return 추천 펀딩/투표 목록
     */
    @Transactional(readOnly = true)
    public List<CardTypeFundingInfoDto> getRecommendedFundings(Long userId) {
        // 1. 사용자 존재 여부 확인
        if (userId != null && !userRepository.existsById(userId)) {
            throw ResourceNotFoundException.ofUser();
        }

        return recommendedFundingRepository.findRecommendedFundings(userId);
    }
}
