package io.ssafy.cinemoa.funding.controller;

import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.global.response.ApiResponse;
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


    @GetMapping
    public ResponseEntity<ApiResponse<?>> search(@ModelAttribute SearchRequest request) {
        
        return ResponseEntity.ok(ApiResponse.ofSuccess(null));
    }
}
