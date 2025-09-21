package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.enums.FundingState;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.core.namedparam.SqlParameterSource;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FundingListRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public List<CardTypeFundingInfoDto> findByFundingIdIn(List<Long> fundingIds, Long userId) {
        String sql = """
                SELECT
                    f.funding_id as funding_id,
                    f.title as title,
                    f.banner_url as banner_url,
                    f.state as state,
                    f.ends_on as ends_on,
                    f.screen_day as screen_day,
                    f.video_name as video_name,
                    s.price as price,
                    f.max_people as max_people,
                    c.cinema_id as cinema_id,
                    c.cinema_name as cinema_name,
                    c.city as city,
                    c.district as district,
                    fs.participant_count as participant_count,
                    fs.favorite_count as favorite_count,
                    fs.view_count as view_count,
                    CASE WHEN lf.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                    f.funding_type as funding_type
                FROM fundings f
                JOIN cinemas c ON f.cinema_id = c.cinema_id
                LEFT JOIN screens s ON f.screen_id = s.screen_id
                LEFT JOIN funding_stats fs ON f.funding_id = fs.funding_id
                LEFT JOIN user_favorites lf ON f.funding_id = lf.funding_id AND lf.user_id = :userId
                WHERE f.funding_id IN (:fundingIds)
                """;

        SqlParameterSource params = new MapSqlParameterSource()
                .addValue("fundingIds", fundingIds)
                .addValue("userId", userId);

        return jdbcTemplate.query(sql, params, this::mapToCardTypeFundingInfoDto);
    }

    private CardTypeFundingInfoDto mapToCardTypeFundingInfoDto(ResultSet rs, int rowNum) throws SQLException {
        Date screenDay = rs.getDate("screen_day");
        // Funding 정보 매핑
        CardTypeFundingInfoDto.BriefFundingInfo fundingInfo = CardTypeFundingInfoDto.BriefFundingInfo.builder()
                .fundingId(rs.getLong("funding_id"))
                .title(rs.getString("title"))
                .bannerUrl(rs.getString("banner_url"))
                .state(FundingState.valueOf(rs.getString("state")))
                .fundingEndsOn(rs.getDate("ends_on").toLocalDate())
                .screenDate(screenDay == null ? null : screenDay.toLocalDate())
                .videoName(rs.getString("video_name"))
                .price(rs.getInt("price"))
                .maxPeople(rs.getInt("max_people"))
                .viewCount(rs.getInt("view_count"))
                .participantCount(rs.getInt("participant_count"))
                .favoriteCount(rs.getInt("favorite_count"))
                .isLiked(rs.getBoolean("is_liked"))
                .fundingType(rs.getString("funding_type"))
                .build();

        // Cinema 정보 매핑
        CardTypeFundingInfoDto.BriefCinemaInfo cinemaInfo = CardTypeFundingInfoDto.BriefCinemaInfo.builder()
                .cinemaId(rs.getLong("cinema_id"))
                .cinemaName(rs.getString("cinema_name"))
                .city(rs.getString("city"))
                .district(rs.getString("district"))
                .build();

        return CardTypeFundingInfoDto.builder()
                .funding(fundingInfo)
                .cinema(cinemaInfo)
                .build();
    }
}
