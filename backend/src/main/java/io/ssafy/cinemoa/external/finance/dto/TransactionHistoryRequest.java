package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

/**
 * 계좌 거래내역 조회 요청 DTO
 * JSON의 필드명과 동일하게 매핑합니다.
 *
 * Header: ReqHeader (공통)
 * accountNo: 계좌번호
 * startDate/endDate: 조회 기간(YYYYMMDD)
 * transactionType: M(입금), D(출금), A(전체)
 * orderByType: ASC/DESC (거래고유번호 기준 정렬)
 */
@Data
@Builder
public class TransactionHistoryRequest {
    @JsonProperty("Header")
    private ReqHeader Header;

    private String accountNo;
    private String startDate;       // 조회 시작일 (YYYYMMDD)
    private String endDate;         // 조회 종료일 (YYYYMMDD)
    private String transactionType; // M/D/A
    private String orderByType;     // ASC/DESC
}
