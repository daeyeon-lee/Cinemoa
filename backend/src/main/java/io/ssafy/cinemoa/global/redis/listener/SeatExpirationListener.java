package io.ssafy.cinemoa.global.redis.listener;


import java.util.regex.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.connection.Message;
import org.springframework.data.redis.connection.MessageListener;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SeatExpirationListener implements MessageListener {
    private static final Pattern SEAT_KEY_PATTERN = Pattern.compile("^seat:\\d+:\\d+$");
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void onMessage(Message message, byte[] pattern) {
        String expiredKey = message.toString();

        // 좌석 키 패턴 확인: "fundingId:userId"
        if (SEAT_KEY_PATTERN.matcher(expiredKey).matches()) {
            String[] parts = expiredKey.split(":");
            long fundingId = Long.parseLong(parts[1]);

            // 잔여 좌석 수 복구
            String remainSeatKey = "remain_seat:" + fundingId;
            redisTemplate.opsForValue().increment(remainSeatKey);
        }
    }
}

