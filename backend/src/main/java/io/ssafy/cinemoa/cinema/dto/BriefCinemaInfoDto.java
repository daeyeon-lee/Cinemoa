package io.ssafy.cinemoa.cinema.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BriefCinemaInfoDto {
    private Long cinemaId;
    private String cinemaName;
    private String city;
    private String district;
    private String address;
    private Boolean isImax;
    private Boolean isScreenx;
    @JsonProperty("4dx")
    private Boolean is4dx;
    private Boolean isDolby;
    private Boolean isRecliner;

    public static BriefCinemaInfoDto of(Cinema cinema) {
        return BriefCinemaInfoDto.builder()
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
                .build();
    }
}
