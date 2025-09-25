package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.enums.FundingState;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ExpiringFundingRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 내가 제안한 펀딩 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 제안한 펀딩 목록
     */
    public List<CardTypeFundingInfoDto> findExpiringFundings(Long userId) {
        // 1. 기본 쿼리 구성
        ExpiringQueryBuilder queryBuilder = new ExpiringQueryBuilder();
        queryBuilder.buildBaseQuery(userId);

        // 4. 쿼리 실행

        return jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToCardTypeFundingInfoDto,
                queryBuilder.getParams().toArray());
    }
    
    /**
     * 제안한 펀딩 아이템 DTO로 매핑합니다.
     */
    private CardTypeFundingInfoDto mapToCardTypeFundingInfoDto(ResultSet rs, int rowNum) throws SQLException {
        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int price = rs.getInt("price");
        int perPersonPrice = (int) Math.ceil((double) price / maxPeople / 10) * 10;
        String fundingType = rs.getString("funding_type");

        // 좋아요 여부
        boolean isLiked = rs.getBoolean("is_liked");

        CardTypeFundingInfoDto.BriefFundingInfo funding = CardTypeFundingInfoDto.BriefFundingInfo.builder()
                .fundingId(rs.getLong("funding_id"))
                .title(rs.getString("title"))
                .bannerUrl(rs.getString("banner_url"))
                .state(FundingState.valueOf(rs.getString("state")))
                .progressRate(progressRate)
                .fundingEndsOn(LocalDate.parse(rs.getString("ends_on")))
                .videoName(rs.getString("video_name"))
                .screenDate(LocalDate.parse(rs.getString("screen_day")))
                .price(perPersonPrice)
                .maxPeople(maxPeople)
                .participantCount(participantCount)
                .isLiked(isLiked)
                .favoriteCount(favoriteCount)
                .fundingType(fundingType)
                .build();

        CardTypeFundingInfoDto.BriefCinemaInfo cinema = CardTypeFundingInfoDto.BriefCinemaInfo.builder()
                .cinemaId(rs.getLong("cinema_id"))
                .cinemaName(rs.getString("cinema_name"))
                .city(rs.getString("city"))
                .district(rs.getString("district"))
                .build();

        return CardTypeFundingInfoDto
                .builder()
                .timestamp(rs.getTimestamp("timestamp").toLocalDateTime())
                .funding(funding)
                .cinema(cinema)
                .build();
    }

    // === Inner Class: ExpiringQueryBuilder ===
    private static class ExpiringQueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Long userId) {
            sql.append("""
                    SELECT f.funding_id, f.title, f.banner_url, f.state, f.ends_on, f.screen_day,
                           f.funding_type, f.max_people, f.video_name, s.price,
                           c.cinema_id, c.cinema_name, c.city, c.district,
                           COALESCE(fs.participant_count, 0) as participant_count,
                           COALESCE(fs.favorite_count, 0) as favorite_count,
                           CASE WHEN ? IS NOT NULL AND uf.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                           f.created_at as timestamp
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ? AND ? IS NOT NULL
                    WHERE f.funding_type = 'FUNDING' AND f.state = 'ON_PROGRESS'
                      AND (
                          f.ends_on <= DATE_ADD(CURRENT_DATE, INTERVAL 2 DAY)
                          OR
                          fs.participant_count * 100 >= f.max_people * 95
                      )
                    ORDER BY
                        CASE WHEN fs.participant_count * 100 >= f.max_people * 95 THEN 1 ELSE 2 END,
                        f.ends_on ASC
                    LIMIT 10
                    """);

            // userId를 파라미터로 추가 (좋아요 조회용, 제안자 조회용)
            params.add(userId);
            params.add(userId);
            params.add(userId);
        }

        public String getSql() {
            return sql.toString();
        }
    }
}
