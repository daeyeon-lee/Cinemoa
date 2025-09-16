package io.ssafy.cinemoa.cinema.repository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ScreenUnavailableTImeBatchRepository {

    private final JdbcTemplate jdbcTemplate;

    public boolean insertRangeIfAvailable(Long screenId, LocalDate targetDate, Byte startHour, Byte endHour) {
        try {
            String insertSql = "INSERT INTO screen_unavailable_time (screen_id, target_date, hour_block) VALUES (?, ?, ?)";

            List<Object[]> batchArgs = new ArrayList<>();
            for (byte hour = startHour; hour <= endHour; ++hour) {
                batchArgs.add(new Object[]{screenId, targetDate, hour});
            }

            jdbcTemplate.batchUpdate(insertSql, batchArgs);
            return true;

        } catch (DataIntegrityViolationException e) {
            return false; // 동시성으로 인한 중복
        }
    }
}
