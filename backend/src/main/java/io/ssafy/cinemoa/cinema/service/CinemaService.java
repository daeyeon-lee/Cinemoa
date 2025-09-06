package io.ssafy.cinemoa.cinema.service;

import io.ssafy.cinemoa.cinema.dto.BriefCinemaInfoDto;
import io.ssafy.cinemoa.cinema.dto.CinemaInfoDto;
import io.ssafy.cinemoa.cinema.repository.CinemaRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final ScreenRepository screenRepository;

    public List<BriefCinemaInfoDto> getAllCinema(String city, String district, List<String> feature, Long cinemaId) {
        List<Cinema> filtered;

        boolean imax = false;
        boolean recliner = false;
        boolean dolby = false;
        boolean screenx = false;
        boolean is4DX = false;

        if (feature != null) {
            imax = feature.contains("IMAX");
            recliner = feature.contains("RECLINER");
            dolby = feature.contains("DOLBY");
            screenx = feature.contains("SCREENX");
            is4DX = feature.contains("4DX");
        }

        filtered = cinemaRepository.findAllByFiltersAny(city, district, imax, screenx, is4DX, dolby, recliner,
                cinemaId);
        List<BriefCinemaInfoDto> result = new ArrayList<>();

        for (Cinema item : filtered) {
            result.add(BriefCinemaInfoDto.of(item));
        }

        return result;
    }

    public CinemaInfoDto getCertainCinema(Long cinemaId) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(ResourceNotFoundException::ofCinema);
        List<Screen> screens = screenRepository.findByCinema_CinemaId(cinemaId);
        return CinemaInfoDto.of(cinema, screens);
    }


}
