package io.ssafy.cinemoa.cinema.repository;

import io.ssafy.cinemoa.cinema.repository.entity.Screen;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {

    @Query("select s from Screen s where s.cinema.cinemaId = ?1")
    List<Screen> findByCinema_CinemaId(Long cinemaId);

}
