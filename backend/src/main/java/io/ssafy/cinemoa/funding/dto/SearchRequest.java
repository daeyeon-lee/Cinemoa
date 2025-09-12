package io.ssafy.cinemoa.funding.dto;

import io.ssafy.cinemoa.cinema.enums.CinemaFeature;
import io.ssafy.cinemoa.funding.enums.FundingSortOrder;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchRequest {

    private String q;
    private Long userId;
    private FundingSortOrder sortBy;
    private Long category;
    private List<String> region;
    private CinemaFeature theaterType;
    private Boolean isClosed;
}
