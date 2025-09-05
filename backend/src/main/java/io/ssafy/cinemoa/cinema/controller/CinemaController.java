package io.ssafy.cinemoa.cinema.controller;

import io.ssafy.cinemoa.cinema.dto.BriefCinemaInfoDto;
import io.ssafy.cinemoa.cinema.dto.CinemaInfoDto;
import io.ssafy.cinemoa.cinema.service.CinemaService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cinema")
public class CinemaController {

    private final CinemaService cinemaService;

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getAllCinema(@RequestParam(required = false) String city,
                                                       @RequestParam(required = false) String district,
                                                       @RequestParam(required = false)
                                                       List<String> feature,
                                                       @RequestParam(required = false) Long cinemaId) {

        List<BriefCinemaInfoDto> result = cinemaService.getAllCinema(city, district, feature, cinemaId);

        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }

    @GetMapping("/{cinemaId}")
    public ResponseEntity<ApiResponse<?>> getCertainCinema(@PathVariable(name = "cinemaId") Long cinemaId) {
        CinemaInfoDto result = cinemaService.getCertainCinema(cinemaId);
        return ResponseEntity.ok(ApiResponse.ofSuccess(result));
    }
}
