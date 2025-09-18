package io.ssafy.cinemoa.funding.dto;

import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoteCreateRequest {
    private Long userId;
    private String title;
    private String content;
    private Long categoryId;
    private String videoName;
    private String posterUrl;
    private Long cinemaId;
    private LocalDate screenMinDate;
    private LocalDate screenMaxDate;
}
