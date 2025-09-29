package io.ssafy.cinemoa.cinema.repository;

import io.ssafy.cinemoa.cinema.repository.entity.ScreenUnavailableTime;
import java.time.LocalDate;
import java.util.Set;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ScreenUnavailableTimeRepository extends JpaRepository<ScreenUnavailableTime, Long> {
    @Query("""
            select s.hourBlock from ScreenUnavailableTime s
            where s.screen.screenId = ?1 and s.targetDate = ?2
            order by s.hourBlock""")
    Set<Byte> findHourBlocksByScreen_ScreenIdAndTargetDateOrderByHourBlockAsc(Long screenId, LocalDate targetDate);


}
