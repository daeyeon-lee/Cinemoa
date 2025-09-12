package io.ssafy.cinemoa.external.finance.dto;

<<<<<<< HEAD
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;
=======
>>>>>>> BE
import lombok.Data;

@Data
public class BaseApiResponse<T> {
<<<<<<< HEAD

    @JsonProperty("Header")   // ✅ 벤더가 "Header" (대문자 H)를 요구하는 경우
    private ResHeader Header;

    @JsonProperty("REC")      // ✅ 벤더가 "REC" (대문자)로 내려주는 경우
    private T REC;
}

=======
  private ResHeader Header; // 공통 헤더
  private T REC; // API별 고유 데이터
}
>>>>>>> BE
