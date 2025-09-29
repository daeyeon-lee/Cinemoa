package io.ssafy.cinemoa.payment.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundingRefundRequest {

  @NotNull(message = "펀딩 ID는 필수입니다.")
  @Positive(message = "펀딩 ID는 양수여야 합니다.")
  private Long fundingId;

  @NotNull(message = "사용자 ID는 필수입니다.")
  @Positive(message = "유저 ID는 양수여야 합니다.")
  private Long userId;
}
