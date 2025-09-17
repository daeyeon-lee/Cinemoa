package io.ssafy.cinemoa.user.service;

import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import io.ssafy.cinemoa.security.dto.AnonymousUserInfo;
import io.ssafy.cinemoa.user.dto.RefundAccountDto;
import io.ssafy.cinemoa.user.dto.RefundAccountResponseDto;
import io.ssafy.cinemoa.user.dto.UserResponseDto;
import io.ssafy.cinemoa.user.repository.UserRepository;
import io.ssafy.cinemoa.user.repository.entity.User;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    // Bank Code와 Bank Name을 매핑하기 위한 Map (static으로 관리)
    private static final Map<String, String> BANK_CODE_MAP = new ConcurrentHashMap<>();

    // static 블록을 사용하여 클래스 로딩 시점에 Map 초기화
    static {
        BANK_CODE_MAP.put("001", "한국은행");
        BANK_CODE_MAP.put("002", "산업은행");
        BANK_CODE_MAP.put("003", "기업은행");
        BANK_CODE_MAP.put("004", "국민은행");
        BANK_CODE_MAP.put("011", "농협은행");
        BANK_CODE_MAP.put("020", "우리은행");
        BANK_CODE_MAP.put("023", "SC제일은행");
        BANK_CODE_MAP.put("027", "시티은행");
        BANK_CODE_MAP.put("032", "대구은행");
        BANK_CODE_MAP.put("034", "광주은행");
        BANK_CODE_MAP.put("035", "제주은행");
        BANK_CODE_MAP.put("037", "전북은행");
        BANK_CODE_MAP.put("039", "경남은행");
        BANK_CODE_MAP.put("045", "새마을금고");
        BANK_CODE_MAP.put("081", "KEB하나은행");
        BANK_CODE_MAP.put("088", "신한은행");
        BANK_CODE_MAP.put("090", "카카오뱅크");
        BANK_CODE_MAP.put("999", "싸피은행");
    }

    private final UserRepository userRepository; // 데이터베이스 조회

    @Transactional(readOnly = true) // 읽기 전용(닉네임, 프로필 이미지 정보 조회) 
    public UserResponseDto getUserInfo(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);
        return UserResponseDto.builder()
                .nickname(user.getNickname())
                .profileImgUrl(user.getProfileImgUrl())
                .build();
    }

    @Transactional(readOnly = true) // 읽기 전용(환불 계좌 정보 조회) 
    public RefundAccountResponseDto getRefundAccount(Long userId) {
        // 1. userId로 사용자 정보 조회, 없으면 404 예외
        User user = userRepository.findById(userId)
                .orElseThrow(ResourceNotFoundException::ofUser);

        String accountNumber = user.getRefundAccountNumber();

        // 2. 환불 계좌번호가 등록되어 있는지 확인
        // StringUtils.hasText()는 null, 빈 문자열(""), 공백(" ")을 모두 false로 처리
        if (!StringUtils.hasText(accountNumber)) {
            // 계좌가 없는 경우, 200 응답
            return RefundAccountResponseDto.builder()
                    .userId(userId)
                    .refundAccount(null)
                    .message("환불계좌를 등록해주세요.")
                    .build();
        } else {
            // 계좌가 있는 경우, 200 응답
            String bankCode = user.getBankCode();
            // Map에서 bankCode에 해당하는 bankName 찾기. 없으면 "기타 은행"으로 표시
            String bankName = BANK_CODE_MAP.getOrDefault(bankCode, "기타 은행");

            RefundAccountDto accountDto = RefundAccountDto.builder()
                    .accountNo(accountNumber)
                    .bankCode(bankCode)
                    .bankName(bankName)
                    .build();

            return RefundAccountResponseDto.builder()
                    .userId(userId)
                    .refundAccount(accountDto)
                    .build();
        }
        //     "userId": 1,
        //     "refundAccount": {
        //          "accountNo": "110123456789",        // 계좌번호 (users.refund_account_number)
        //          "bankName": "국민은행",                  // 은행명 (계좌번호 기반 추론)
        //          "bankCode": "004",                        // 은행코드 (users.bank_code)
        //     }
    }

    @Transactional
    public User getOrSave(AnonymousUserInfo userInfo) {
        User user = userRepository.findByUsername(userInfo.getEmail());

        if (user == null) {
            user = userInfo.toUser();
            user = userRepository.save(user);
        }

        return user;
    }
}
