package io.ssafy.cinemoa.external.finance.enums;

/* 계좌이체 타입 */
public enum TransferType {
    REFUND("환불 이체", "(펀딩환불) : 입금(이체)", "(펀딩환불) : 출금(이체)"),
    CINEMA_TRANSFER("영화관 송금", "(펀딩성공송금) : 입금(이체)", "(펀딩성공송금) : 출금(이체)");

    private final String description;
    private final String depositSummary;
    private final String withdrawalSummary;

    TransferType(String description, String depositSummary, String withdrawalSummary) {
        this.description = description;
        this.depositSummary = depositSummary;
        this.withdrawalSummary = withdrawalSummary;
    }

    public String getDescription() {
        return description;
    }

    public String getDepositSummary() {
        return depositSummary;
    }

    public String getWithdrawalSummary() {
        return withdrawalSummary;
    }
}
