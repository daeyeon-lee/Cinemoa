package io.ssafy.cinemoa.cinema.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaInfoDto {
    private Long cinemaId;
    private String cinemaName;
    private String city;
    private String district;
    private String address;

    @JsonProperty("imax")
    private Boolean isImax;
    @JsonProperty("screenx")
    private Boolean isScreenx;
    @JsonProperty("4dx")
    private Boolean is4dx;
    @JsonProperty("dolby")
    private Boolean isDolby;
    @JsonProperty("recliner")
    private Boolean isRecliner;

    private List<BriefScreenInfoDto> screens;

    public static CinemaInfoDto of(Cinema cinema, List<Screen> screens) {
        List<BriefScreenInfoDto> screenInfoDtos = new ArrayList<>();

        for (Screen item : screens) {
            screenInfoDtos.add(BriefScreenInfoDto.of(item));
        }

        return CinemaInfoDto.builder()
                .cinemaId(cinema.getCinemaId())
                .cinemaName(cinema.getCinemaName())
                .city(cinema.getCity())
                .district(cinema.getDistrict())
                .address(cinema.getAddress())
                .isImax(cinema.getIsImax())
                .isScreenx(cinema.getIsScreenX())
                .is4dx(cinema.getIs4dx())
                .isDolby(cinema.getIsDolby())
                .isRecliner(cinema.getIsRecliner())
                .screens(screenInfoDtos)
                .build();
    }
}
