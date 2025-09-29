package io.ssafy.cinemoa.external.finance.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

/**
 * 계좌 거래내역 조회 응답 REC
 * BaseApiResponse<TransactionHistoryResponse> 형태로 감싸집니다.
 *
 * totalCount: 총 건수(문자열로 전달됨)
 * list: 거래 내역 리스트
 */
@Data
@Getter
@Setter
public class TransactionHistoryResponse {
    // 응답 헤더 정보
    private String responseCode;
    private String responseMessage;

    private String totalCount;
    private List<TransactionHistoryItem> list;

    // 개별 거래
    @Data
    public static class TransactionHistoryItem {
        // 각 거래 내역 조회 응답 정보
        private String transactionUniqueNo;     // 거래 고유번호
        private String transactionDate;         // YYYYMMDD
        private String transactionTime;         // HHmmss
        private String transactionType;         // 1:입금, 2:출금
        private String transactionTypeName;     // 입금/출금/입금(이체)/출금(이체)
        private String transactionAccountNo;    // 상대 계좌 등(없을 수 있음)
        private String transactionBalance;      // 거래 금액
        private String transactionAfterBalance; // 거래 후 잔액
        private String transactionSummary;      // 요약(예: CINEMOA 4599)
        private String transactionMemo;         // 메모(없으면 빈 문자열)
    }
}
