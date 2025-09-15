package io.ssafy.cinemoa.payment.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FundingRefundResponse {

  private String transactionUniqueNo;
  private Long fundingId;
  private Long userId;
  private RefundInfo refundInfo;

  @Data
  @Builder
  public static class RefundInfo {
    private Integer refundAmount;
    private String refundAccountNo;
    private LocalDateTime refundDateTime;
  }
}
