package io.ssafy.cinemoa.cinema.service;

import io.ssafy.cinemoa.cinema.dto.ScreenInfoDto;
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenUnavailableTimeRepository;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScreenService {

    private final ScreenRepository screenRepository;
    private final ScreenUnavailableTimeRepository timeRepository;

    public ScreenInfoDto getAvailableTimesOfScreen(Long screenId, LocalDate targetDate) {
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(ResourceNotFoundException::ofScreen);

        Set<Byte> unavailableTimes = timeRepository.findHourBlocksByScreen_ScreenIdAndTargetDateOrderByHourBlockAsc(
                screenId, targetDate);

        List<Byte> timeblocks = new ArrayList<>();
        for (byte i = 0; i <= 23; ++i) {
            if (i >= 4 && i < 7) {
                continue;
            }
            if (!unavailableTimes.contains(i)) {
                timeblocks.add(i);
            }
        }

        return ScreenInfoDto.of(screen, timeblocks);
    }
}
