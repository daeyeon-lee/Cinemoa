package io.ssafy.cinemoa.payment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.validation.annotation.Validated;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Validated
public class FundingPaymentRequest {
    @NotBlank(message = "카드 번호는 필수입니다.")
    @Pattern(regexp = "^[0-9]{16}$", message = "카드 번호는 16자리 숫자여야 합니다.")
    private String cardNumber;

    @NotBlank(message = "CVC 번호는 필수입니다.")
    @Pattern(regexp = "^[0-9]{3}$", message = "CVC는 숫자 3자리여야 합니다.")
    private String cardCvc;

    @NotNull(message = "펀딩 ID는 필수입니다.")
    @Positive(message = "펀딩 ID는 양수여야 합니다.")
    private Long fundingId;

    @NotNull(message = "유저 ID는 필수입니다.")
    @Positive(message = "유저 ID는 양수여야 합니다.")
    private Long userId;

    @NotNull(message = "결제 금액은 필수입니다.")
    @Positive(message = "결제 금액은 0보다 커야 합니다.")
    private Long amount;
}
