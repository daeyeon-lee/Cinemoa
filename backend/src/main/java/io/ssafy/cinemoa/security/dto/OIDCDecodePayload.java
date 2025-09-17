package io.ssafy.cinemoa.security.dto;

import java.util.Date;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class OIDCDecodePayload {
    private String iss;
    private Set<String> aud;
    private Date exp;
    private String picture;
    private String email;
}
