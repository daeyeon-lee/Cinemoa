package io.ssafy.cinemoa.image.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnimateDoneEvent {

    private Long fundingId;
    private String animationUrl;
}
