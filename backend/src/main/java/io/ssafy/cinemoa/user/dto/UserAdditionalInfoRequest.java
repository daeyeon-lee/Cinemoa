package io.ssafy.cinemoa.user.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdditionalInfoRequest {

    // 카테고리 ID 목록 (최소 1개, 최대 3개, 하위 카테고리만 선택 가능, 중복 불가)
    private List<Long> categoryIds;

    // 은행코드 (현재 DB에 필드가 없지만 향후 추가 예정)
    private String bankCode;

    // 계좌번호
    private String accountNo;

    private String email;

    private String hash;

}
