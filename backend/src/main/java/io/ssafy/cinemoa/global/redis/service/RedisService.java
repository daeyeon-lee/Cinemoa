package io.ssafy.cinemoa.global.redis.service;

import java.time.Duration;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public <T> void setValue(String key, T value) {
        redisTemplate.opsForValue().set(key, value);
    }

    public <T> void setValue(String key, T value, Duration duration) {
        redisTemplate.opsForValue().set(key, value, duration);
    }

    public <T> Boolean setValueIfAbsent(String key, T value, Duration duration) {
        return redisTemplate.opsForValue().setIfAbsent(key, value, duration);
    }

    public <T> Boolean setValueIfAbsent(String key, T value) {
        return redisTemplate.opsForValue().setIfAbsent(key, value);
    }

    public <T> T getValue(T key) {
        return (T) redisTemplate.opsForValue().get(key);
    }

    public Boolean removeKey(String key) {
        return redisTemplate.delete(key);
    }

    public void decreaseValue(String string) {
        redisTemplate.opsForValue().decrement(string);
    }

    public List<Object> execute(RedisScript<List> script, List<String> keys, Object... args) {
        return redisTemplate.execute(script, keys, args);
    }
}
