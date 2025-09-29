package io.ssafy.cinemoa.cinema.service;

import io.ssafy.cinemoa.cinema.dto.BriefCinemaInfoDto;
import io.ssafy.cinemoa.cinema.dto.CinemaInfoDto;
import io.ssafy.cinemoa.cinema.enums.CinemaFeature;
import io.ssafy.cinemoa.cinema.repository.CinemaRepository;
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CinemaService {

    private final CinemaRepository cinemaRepository;
    private final ScreenRepository screenRepository;

    public List<BriefCinemaInfoDto> getAllCinema(String city, String district, Set<CinemaFeature> feature,
                                                 Long cinemaId) {
        List<Cinema> filtered;

        boolean imax = false;
        boolean recliner = false;
        boolean dolby = false;
        boolean screenx = false;
        boolean fDX = false;
        boolean normal = false;

        if (feature != null) {
            imax = feature.contains(CinemaFeature.IMAX);
            recliner = feature.contains(CinemaFeature.RECLINER);
            dolby = feature.contains(CinemaFeature.DOLBY);
            screenx = feature.contains(CinemaFeature.SCREENX);
            fDX = feature.contains(CinemaFeature.FDX);
            normal = feature.contains(CinemaFeature.NORMAL);
        }

        filtered = cinemaRepository.findAllByFiltersAny(city, district, imax, screenx, fDX, dolby, recliner, normal,
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
