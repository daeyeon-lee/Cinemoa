package io.ssafy.cinemoa.cinema.repository;

import io.ssafy.cinemoa.cinema.repository.entity.Cinema;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CinemaRepository extends JpaRepository<Cinema, Long> {

    @Query("""
              select distinct c
              from Cinema c
              where (:city is null or c.city like :city)
                and (:district is null or c.district like :district)
                and (:cinemaId is null or c.id = :cinemaId)
                and (:isimax <> true or c.isImax = true)
                and (:isscreenx <> true or c.isScreenX = true)
                and (:is4dx <> true or c.is4dx = true)
                and (:isdolby <> true or c.isDolby = true)
                and (:isrecliner <> true or c.isRecliner = true)
            """)
    List<Cinema> findAllByFiltersAny(@Param("city") String city,
                                     @Param("district") String district,
                                     @Param("isimax") Boolean imax,
                                     @Param("isscreenx") Boolean screenx,
                                     @Param("is4dx") Boolean is4dx,
                                     @Param("isdolby") Boolean dolby,
                                     @Param("isrecliner") Boolean recliner,
                                     @Param("cinemaId") Long cinemaId);
}
