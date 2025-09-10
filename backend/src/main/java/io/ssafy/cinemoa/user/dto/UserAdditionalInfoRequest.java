package io.ssafy.cinemoa.user.dto;

import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAdditionalInfoRequest {
    
    // 카테고리 ID 목록 (최소 1개, 최대 3개, 하위 카테고리만 선택 가능, 중복 불가)
    @JsonProperty("categoryIds")
    private List<Long> categoryIds;
    
    // 은행코드 (현재 DB에 필드가 없지만 향후 추가 예정)
    @JsonProperty("bankCode")
    private String bankCode;
    
    // 계좌번호
    @JsonProperty("accountNo")
    private String accountNo;
        
}
