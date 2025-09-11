package io.ssafy.cinemoa.funding.service;

import io.ssafy.cinemoa.funding.dto.SearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SearchService {
    public Page<?> searchWithText(SearchRequest request) {
        return null;
    }

    public Page<?> search(SearchRequest request) {
        return null;
    }
}
