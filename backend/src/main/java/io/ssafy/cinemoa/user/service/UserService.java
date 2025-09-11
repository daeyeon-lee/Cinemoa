package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.user.dto.UserResponseDto;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import lombok.RequiredArgsConstructor; // 생성자 주입
import org.springframework.stereotype.Service; // 서비스 어노테이션 -> 비즈니스 로직 처리
import org.springframework.transaction.annotation.Transactional; // 트랜잭션 어노테이션 -> 데이터베이스 조회 시 사용

@Service
@RequiredArgsConstructor 
public class UserService {

    private final UserRepository userRepository; // 데이터베이스 조회

    @Transactional(readOnly = true) // 읽기 전용(조회) 
    public UserResponseDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);
        return UserResponseDto.builder()
                .nickname(user.getNickname())
                .profileImgUrl(user.getProfileImgUrl())
                .build();
    }
}
