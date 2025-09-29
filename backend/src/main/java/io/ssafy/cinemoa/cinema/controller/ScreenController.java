package io.ssafy.cinemoa.cinema.controller;

import io.ssafy.cinemoa.cinema.dto.ScreenInfoDto;
import io.ssafy.cinemoa.cinema.service.ScreenService;
import io.ssafy.cinemoa.global.response.ApiResponse;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/screen")
public class ScreenController {

    private final ScreenService screenService;


    @GetMapping("/{screenId}/available-time")
    public ResponseEntity<ApiResponse<?>> getAvailableTimesOfScreen(@PathVariable("screenId") Long screenId,
                                                                    @RequestParam
                                                                    LocalDate targetDate) {
        ScreenInfoDto info = screenService.getAvailableTimesOfScreen(screenId, targetDate);

        return ResponseEntity.ok(ApiResponse.ofSuccess(info));
    }
}
