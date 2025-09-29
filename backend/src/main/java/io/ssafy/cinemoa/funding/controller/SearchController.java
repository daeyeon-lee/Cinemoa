package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.service.SearchService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import io.ssafy.cinemoa.global.response.CursorResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<ApiResponse<CursorResponse<?>>> search(@ModelAttribute SearchRequest request) {
        return ResponseEntity.ok(ApiResponse.ofSuccess(searchService.search(request)));
    }
}
