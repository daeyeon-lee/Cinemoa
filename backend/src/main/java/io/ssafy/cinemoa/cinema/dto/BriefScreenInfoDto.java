package io.ssafy.cinemoa.cinema.dto;


import com.fasterxml.jackson.annotation.JsonProperty;
import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BriefScreenInfoDto {

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

    public static BriefScreenInfoDto of(Screen screen) {
        return BriefScreenInfoDto.builder()
                .screenId(screen.getScreenId())
                .screenName(screen.getScreenName())
                .isImax(screen.getIsImax())
                .isScreenx(screen.getIsScreenX())
                .is4dx(screen.getIs4dx())
                .isDolby(screen.getIsDolby())
                .isRecliner(screen.getIsRecliner())
                .seats(screen.getSeats())
                .price(screen.getPrice())
                .build();
    }
}
