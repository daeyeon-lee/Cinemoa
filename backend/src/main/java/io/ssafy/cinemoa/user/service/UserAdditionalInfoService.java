package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.category.repository.CategoryRepository;
import io.ssafy.cinemoa.category.repository.entity.Category;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.user.dto.UserAdditionalInfoRequest;
import io.ssafy.cinemoa.user.repository.UserCategoryRepository;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import io.ssafy.cinemoa.user.repository.entity.UserCategory;
import io.ssafy.cinemoa.user.repository.entity.UserCategoryId;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserAdditionalInfoService {

    private final UserRepository userRepository;
    private final UserCategoryRepository userCategoryRepository;
    private final CategoryRepository categoryRepository;
    private final WonAuthService wonAuthService;

    @Transactional // 트랜잭션 처리 -> 모든 작업이 성공적으로 완료되거나 실패해야 함
    public void addAdditionalInfo(Long userId, UserAdditionalInfoRequest request) {
        // 1. 사용자 조회 (없으면 404 예외)
        User user = userRepository.findById(userId).orElseThrow(ResourceNotFoundException::ofUser);

        // 2. 1원 인증 해시값 검증 (보안 검증)
        String normalizedAccountNo = request.getAccountNo().replaceAll("-", "");
        if (!wonAuthService.verifyHashForSignup(normalizedAccountNo, request.getHash())) {
            throw BadRequestException.ofWonAuth("1원 인증이 필요하거나 만료되었습니다.");
        }

        // 3. 카테고리 유효성 검증, 세부 카테고리 즉 부모 카테고리 id가 null이 아닌 카테고리만 선택 가능
        List<Long> categoryIds = request.getCategoryIds();
        List<Category> validatedCategories = validateCategories(categoryIds);

        // 4. 계좌 유효성 검증 (나중에 api 연결)
        if (!isValidAccount(request.getBankCode(), normalizedAccountNo)) {
            throw BadRequestException.ofAccount();
        }

        // 5. 사용자 정보 업데이트
        user.updateAdditionalInfo(normalizedAccountNo, request.getBankCode());
        userRepository.save(user); // 명시적으로 저장 (Dirty Checking은 트랜잭션 커밋 시 작동)

        // 6. 기존 사용자-카테고리 관계 삭제 (중복 방지)
        userCategoryRepository.deleteByUserId(userId);

        // 7. 새로운 사용자-카테고리 관계 저장
        List<UserCategory> userCategories = validatedCategories.stream()
                .map(category -> {
                    UserCategoryId userCategoryId = new UserCategoryId(userId, category.getCategoryId());
                    return UserCategory.builder()
                            .id(userCategoryId)
                            .user(user)
                            .category(category)
                            .build();
                })
                .collect(java.util.stream.Collectors.toList());
        userCategoryRepository.saveAll(userCategories);
    }

    private List<Category> validateCategories(List<Long> categoryIds) {
        // 카테고리 개수 검증 (최소 4개, 최대 12개)
        if (categoryIds == null || categoryIds.isEmpty()) {
            throw BadRequestException.ofInput();
        }
        if (categoryIds.size() < 4) {
            throw BadRequestException.ofInput();
        }
        if (categoryIds.size() > 12) {
            throw BadRequestException.ofInput();
        }

        // 중복 ID 검증
        Set<Long> uniqueIds = new HashSet<>(categoryIds);
        if (uniqueIds.size() != categoryIds.size()) {
            throw BadRequestException.ofInput();
        }

        // DB에서 카테고리 조회
        List<Category> categories = categoryRepository.findAllById(categoryIds);
        if (categories.size() != categoryIds.size()) {
            throw BadRequestException.ofInput();
        }

        // 하위 카테고리 여부 검증 (부모 카테고리가 있는 카테고리만 선택 가능)
        for (Category category : categories) {
            if (category.getParentCategory() == null) {
                throw BadRequestException.ofInput();
            }
        }
        return categories;
    }

    // 계좌 유효성 검증 로직 (임시 구현)
    private boolean isValidAccount(String bankCode, String accountNo) {
        // TODO: 실제 은행 API 연동 또는 정규식 등을 통한 검증 로직 구현
        // 현재는 항상 true를 반환하여 통과시킴
        return true;
    }
}
