package io.ssafy.cinemoa.security.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponseDto {

    private long userId;
    private String email;

    @JsonProperty("isAnonymous")
    private boolean isAnonymous;
}
