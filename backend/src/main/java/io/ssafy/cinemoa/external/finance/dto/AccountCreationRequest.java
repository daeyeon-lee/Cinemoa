package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountCreationRequest {
    @JsonProperty("Header")
    private ReqHeader header;

    @Builder.Default
    private String accountTypeUniqueNo = "001-1-4e9d1f678a1c4e";
}
