package io.ssafy.cinemoa.funding.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimestampCursorInfo {
    private LocalDateTime createdAt;
    private Long fundingId;
}
