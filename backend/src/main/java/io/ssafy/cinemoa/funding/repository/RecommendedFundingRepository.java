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

/**
 * 추천 펀딩 목록 조회를 위한 Repository
 * <p>
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Repository
@RequiredArgsConstructor
public class RecommendedFundingRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 추천 펀딩/투표 목록을 조회합니다.
     *
     * @param userId 사용자 ID
     * @return 추천 펀딩/투표 목록
     */
    public List<CardTypeFundingInfoDto> findRecommendedFundings(Long userId) {
        // 1. 기본 쿼리 구성
        RecommendedQueryBuilder queryBuilder = new RecommendedQueryBuilder();

        if (userId != null) {
            queryBuilder.buildUserSpecificBaseQuery(userId);
        } else {
            queryBuilder.buildBaseQuery();
        }

        // 4. 쿼리 실행

        return jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToCardTypeFundingInfoDto,
                queryBuilder.getParams().toArray()
        );
    }

    /**
     * 추천 펀딩 아이템 DTO로 매핑합니다.
     */
    private CardTypeFundingInfoDto mapToCardTypeFundingInfoDto(ResultSet rs, int rowNum) throws SQLException {
        String fundingType = rs.getString("funding_type");

        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int viewCount = rs.getInt("view_count");
        int price = rs.getInt("price");
        Integer perPersonPrice = (maxPeople > 0) ? price / maxPeople : -1;

        // 좋아요 여부
        boolean isLiked = rs.getBoolean("is_liked");

        CardTypeFundingInfoDto.BriefFundingInfo funding = CardTypeFundingInfoDto.BriefFundingInfo.builder()
                .fundingId(rs.getLong("funding_id"))
                .title(rs.getString("title"))
                .bannerUrl(rs.getString("banner_url"))
                .state(FundingState.valueOf(rs.getString("state")))
                .progressRate(progressRate)
                .fundingEndsOn(LocalDate.parse(rs.getString("ends_on")))
                .screenDate(LocalDate.parse(rs.getString("screen_day")))
                .videoName(rs.getString("video_name"))
                .price(perPersonPrice)
                .maxPeople(maxPeople)
                .participantCount(participantCount)
                .isLiked(isLiked)
                .fundingType(fundingType)
                .favoriteCount(favoriteCount)
                .viewCount(viewCount)
                .build();

        CardTypeFundingInfoDto.BriefCinemaInfo cinema = CardTypeFundingInfoDto.BriefCinemaInfo.builder()
                .cinemaId(rs.getLong("cinema_id"))
                .cinemaName(rs.getString("cinema_name"))
                .city(rs.getString("city"))
                .district(rs.getString("district"))
                .build();

        return CardTypeFundingInfoDto.builder()
                .funding(funding)
                .cinema(cinema)
                .build();
    }

    private static class RecommendedQueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildUserSpecificBaseQuery(Long userId) {
            sql.append("""
                    WITH user_preferred AS (
                        SELECT f.funding_id, f.title, f.summary, f.banner_url, f.state, f.ends_on, f.screen_day,
                               f.funding_type, f.max_people, f.category_id, f.video_name, s.price,
                               c.cinema_id, c.cinema_name, c.city, c.district,
                               COALESCE(fs.participant_count, 0) as participant_count,
                               COALESCE(fs.favorite_count, 0) as favorite_count,
                               COALESCE(fs.view_count, 0) as view_count,
                               CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                               COALESCE(fs.recommend_score, 0) as recommend_score,
                               1 as priority
                        FROM fundings f
                        INNER JOIN user_categories uc ON uc.category_id = f.category_id AND uc.user_id = ?
                        LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                        LEFT JOIN screens s ON f.screen_id = s.screen_id
                        LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                        LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                        WHERE f.leader_id != ?
                          AND f.state = 'ON_PROGRESS'
                        ORDER BY fs.recommend_score DESC
                        LIMIT 10
                    ),
                    fallback_fundings AS (
                        SELECT f.funding_id, f.title, f.summary, f.banner_url, f.state, f.ends_on, f.screen_day,
                               f.funding_type, f.max_people, f.category_id, f.video_name, s.price,
                               c.cinema_id, c.cinema_name, c.city, c.district,
                               COALESCE(fs.participant_count, 0) as participant_count,
                               COALESCE(fs.favorite_count, 0) as favorite_count,
                               COALESCE(fs.view_count, 0) as view_count,
                               false as is_liked,
                               COALESCE(fs.recommend_score, 0) as recommend_score,
                               2 as priority
                        FROM fundings f
                        LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                        LEFT JOIN screens s ON f.screen_id = s.screen_id
                        LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                        WHERE f.state = 'ON_PROGRESS'
                          AND f.funding_id NOT IN (SELECT funding_id FROM user_preferred)
                        ORDER BY fs.recommend_score DESC
                        LIMIT 10
                    )
                    SELECT * FROM (
                        SELECT * FROM user_preferred
                        UNION ALL
                        SELECT * FROM fallback_fundings
                        ORDER BY priority, recommend_score DESC
                        LIMIT 10
                    ) AS final_result
                    """);
            // userId를 파라미터로 추가 (좋아요 조회용, 생성자 제외용)
            params.add(userId);
            params.add(userId);
            params.add(userId);
        }

        public void buildBaseQuery() {
            sql.append("""
                    SELECT f.funding_id, f.title, f.summary, f.banner_url, f.state, f.ends_on, f.screen_day,
                               f.funding_type, f.max_people, f.category_id, f.video_name, s.price,
                               c.cinema_id, c.cinema_name, c.city, c.district,
                               COALESCE(fs.participant_count, 0) as participant_count,
                               COALESCE(fs.favorite_count, 0) as favorite_count,
                               COALESCE(fs.view_count, 0) as view_count,
                               false as is_liked
                        FROM fundings f
                        LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                        LEFT JOIN screens s ON f.screen_id = s.screen_id
                        LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                        WHERE f.state = 'ON_PROGRESS'
                        ORDER BY COALESCE(fs.recommend_score, 0) DESC
                        LIMIT 10
                    """);
        }

        public String getSql() {
            return sql.toString();
        }
    }
}
