package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.user.dto.RefundAccountUpdateRequestDto;
import io.ssafy.cinemoa.user.repository.RefundAccountUpdateRepository;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * 환불계좌 변경을 위한 Service
 */
@Service
@RequiredArgsConstructor
public class RefundAccountUpdateService {

    private final RefundAccountUpdateRepository refundAccountUpdateRepository;
    private final UserRepository userRepository;

    /**
     * 환불계좌 정보를 업데이트
     * @param userId 사용자 ID
     * @param requestDto 환불계좌 변경 요청 DTO
     */
    @Transactional
    public void updateRefundAccount(Long userId, RefundAccountUpdateRequestDto requestDto) {
        // 1. 사용자 존재 여부 확인
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        // TODO: JWT 토큰 기능 구현 후 활성화
        // 2. 권한 검증 (JWT 토큰에서 추출한 사용자 ID와 요청 경로의 userId 비교)
        // Long tokenUserId = getCurrentUserIdFromToken(); // JWT 토큰에서 사용자 ID 추출
        // if (!tokenUserId.equals(userId)) {
        //     throw new AccessDeniedException("해당 사용자에 접근할 권한이 없습니다.");
        // }

        // 3. 계좌번호 유효성 검증 및 하이픈 제거
        String cleanedAccountNo = validateAndCleanAccountNumber(requestDto.getAccountNo());

        // 4. 은행코드 유효성 검증
        validateBankCode(requestDto.getBankCode());

        // 5. 환불계좌 정보 업데이트
        refundAccountUpdateRepository.updateRefundAccount(
                userId, 
                cleanedAccountNo, 
                requestDto.getBankCode()
        );
    }

    /**
     * 계좌번호 유효성 검증 및 하이픈 제거
     * @param accountNo 계좌번호
     * @return 하이픈이 제거된 계좌번호
     */
    private String validateAndCleanAccountNumber(String accountNo) {
        if (!StringUtils.hasText(accountNo)) {
            throw BadRequestException.ofAccount();
        }
        
        // 하이픈 제거
        String cleanedAccountNo = accountNo.replaceAll("-", "");
        
        // 계좌번호 형식 검증 (숫자만 허용, 10-20자리)
        if (!cleanedAccountNo.matches("^[0-9]{10,20}$")) {
            throw BadRequestException.ofAccount();
        }
        
        return cleanedAccountNo;
    }

    /**
     * 은행코드 유효성 검증
     * @param bankCode 은행코드
     */
    private void validateBankCode(String bankCode) {
        if (!StringUtils.hasText(bankCode)) {
            throw BadRequestException.ofAccount();
        }
        
        // 은행코드 형식 검증 (3자리 숫자)
        if (!bankCode.matches("^[0-9]{3}$")) {
            throw BadRequestException.ofAccount();
        }
    }
}
