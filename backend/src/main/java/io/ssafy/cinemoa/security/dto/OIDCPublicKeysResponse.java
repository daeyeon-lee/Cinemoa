package io.ssafy.cinemoa.security.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Getter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class OIDCPublicKeysResponse {

    List<OIDCPublicKeyDto> keys;

    @Getter
    @ToString
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OIDCPublicKeyDto {
        private String kid;
        private String alg;
        private String use;
        private String n;
        private String e;
        private String kty;
    }
}
