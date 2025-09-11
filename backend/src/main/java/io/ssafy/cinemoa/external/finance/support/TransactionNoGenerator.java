package io.ssafy.cinemoa.external.finance.support;

import lombok.experimental.UtilityClass;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

/**
 * institutionTransactionUniqueNo 생성기
 * 형식: yyyyMMdd + HHmmssSSS(중복 방지를 위해 밀리초까지) + 3자리 난수 (총 20자리)
 */
@UtilityClass
public class TransactionNoGenerator {

    private static final DateTimeFormatter TS = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS");

    public static String generateTransactionUniqueNo() {
        String ts = LocalDateTime.now().format(TS);        // 17자리
        int rand = ThreadLocalRandom.current().nextInt(1000); // 0~999
        return ts + String.format("%03d", rand);           // 총 20자리
    }
}
