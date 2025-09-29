package io.ssafy.cinemoa.payment.enums;

/**
 * 펀딩 작업 컨텍스트
 * 
 * 펀딩과 관련된 작업(결제/환불) 수행 시 검증 컨텍스트를 구분하기 위해 사용
 */
public enum FundingOperationContext {
  PAYMENT("결제", "펀딩 기간이 종료되어 결제할 수 없습니다."),
  REFUND("환불", "펀딩 기간이 종료되어 환불할 수 없습니다.");

  private final String operationType;
  private final String validationErrorMessage;

  FundingOperationContext(String operationType, String validationErrorMessage) {
    this.operationType = operationType;
    this.validationErrorMessage = validationErrorMessage;
  }

  /**
   * 작업 타입명 반환
   */
  public String getOperationType() {
    return operationType;
  }

  /**
   * 검증 실패 시 에러 메시지 반환
   */
  public String getValidationErrorMessage() {
    return validationErrorMessage;
  }
}
