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
                  and (
                    (
                      (:isimax is null or :isimax = false or c.isImax = true)
                      and (:isscreenx is null or :isscreenx = false or c.isScreenX = true)
                      and (:is4dx is null or :is4dx = false or c.is4dx = true)
                      and (:isdolby is null or :isdolby = false or c.isDolby = true)
                      and (:isrecliner is null or :isrecliner = false or c.isRecliner = true)
                    )
                    or (
                      :normal = true 
                      and c.isImax = false 
                      and c.isScreenX = false 
                      and c.is4dx = false 
                      and c.isDolby = false 
                      and c.isRecliner = false
                    )
                  )
            """)
    List<Cinema> findAllByFiltersAny(@Param("city") String city,
                                     @Param("district") String district,
                                     @Param("isimax") Boolean imax,
                                     @Param("isscreenx") Boolean screenx,
                                     @Param("is4dx") Boolean is4dx,
                                     @Param("isdolby") Boolean dolby,
                                     @Param("isrecliner") Boolean recliner,
                                     @Param("normal") Boolean normal,
                                     @Param("cinemaId") Long cinemaId);
}
