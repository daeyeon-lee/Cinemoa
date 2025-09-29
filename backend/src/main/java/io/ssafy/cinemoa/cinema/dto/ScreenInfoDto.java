package io.ssafy.cinemoa.cinema.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScreenInfoDto {

    private Long screenId;
    private String screenName;
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
    private Integer seats;
    private Integer price;

    @JsonProperty("available_time")
    private List<Byte> availableTime;

    public static ScreenInfoDto of(Screen screen, List<Byte> timeblocks) {
        return ScreenInfoDto.builder()
                .screenId(screen.getScreenId())
                .screenName(screen.getScreenName())
                .isImax(screen.getIsImax())
                .isScreenx(screen.getIsScreenX())
                .is4dx(screen.getIs4dx())
                .isDolby(screen.getIsDolby())
                .isRecliner(screen.getIsRecliner())
                .seats(screen.getSeats())
                .price(screen.getPrice())
                .availableTime(timeblocks)
                .build();
    }
}
