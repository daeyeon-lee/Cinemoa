package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.repository.FundingFilterRepository;
import io.ssafy.cinemoa.global.response.CursorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final FundingFilterRepository filterRepository;

    public CursorResponse<CardTypeFundingInfoDto> search(SearchRequest request) {
        return switch (request.getSortBy()) {
            case RECOMMENDED -> filterRepository.findRecommendedWithFilters(request);
            case POPULAR -> filterRepository.findPopularWithFilters(request);
            default -> filterRepository.findLatestWithFilters(request);
        };
    }
}
