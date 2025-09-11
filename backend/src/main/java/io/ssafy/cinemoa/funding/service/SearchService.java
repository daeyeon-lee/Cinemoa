package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.dto.SearchResultDto;
import io.ssafy.cinemoa.funding.repository.FundingFilterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final FundingFilterRepository filterRepository;

    public Page<SearchResultDto> search(SearchRequest request, Pageable pageable) {
        return filterRepository.findWithFilters(request, pageable);
    }

    public Page<SearchResultDto> searchFunding(SearchRequest request, Pageable pageable) {
        return filterRepository.findFundingWithFilters(request, pageable);
    }

    public Page<SearchResultDto> searchVote(SearchRequest request, Pageable pageable) {
        return filterRepository.findVotesWithFilters(request, pageable);
    }
}
