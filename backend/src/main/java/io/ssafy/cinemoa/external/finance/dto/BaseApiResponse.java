package io.ssafy.cinemoa.external.finance.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BaseApiResponse<T> {

    @JsonProperty("Header")   // ✅ 벤더가 "Header" (대문자 H)를 요구하는 경우
    private ResHeader Header;

    @JsonProperty("REC")      // ✅ 벤더가 "REC" (대문자)로 내려주는 경우
    private T REC;
}

