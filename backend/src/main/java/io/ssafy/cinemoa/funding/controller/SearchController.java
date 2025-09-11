package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.service.SearchService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {

    private SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<?>>> search(@ModelAttribute SearchRequest request) {
        if (StringUtils.hasText(request.getQ())) {

            return ResponseEntity.ok(ApiResponse.ofSuccess(searchService.searchWithText(request)));
        }

        return ResponseEntity.ok(ApiResponse.ofSuccess(searchService.search(request)));
    }
}
