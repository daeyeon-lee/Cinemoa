package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.dto.MetadataDto;
import io.ssafy.cinemoa.funding.dto.RecommendedFundingItemDto;
import io.ssafy.cinemoa.funding.dto.RecommendedFundingRequestDto;
import io.ssafy.cinemoa.funding.enums.FundingType;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/**
 * 추천 펀딩 목록 조회를 위한 Repository
 * 
 * API 경로: GET /api/user/{userId}/recommended-funding
 */
@Repository
@RequiredArgsConstructor
public class RecommendedFundingListRepository {

    private final JdbcTemplate jdbcTemplate;
    
    // 추천 점수 계산을 위한 가중치 상수
    private static final double PROGRESS_RATE_WEIGHT = 0.5;
    private static final double FAVORITE_WEIGHT = 0.3;
    private static final double VIEW_WEIGHT = 0.2;

    /**
     * 추천 펀딩/투표 목록을 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param request 추천 펀딩 목록 조회 요청
     * @param typeStr 타입 필터 문자열 (funding, vote)
     * @return 추천 펀딩/투표 목록
     */
    public Page<RecommendedFundingItemDto> findRecommendedFundings(Long userId, RecommendedFundingRequestDto request, String typeStr) {
        // 1. 기본 쿼리 구성
        RecommendedQueryBuilder queryBuilder = new RecommendedQueryBuilder();
        queryBuilder.buildBaseQuery(userId);

        // 2. 동적 조건 추가 (커서와 타입 필터)
        addRecommendedDynamicConditions(queryBuilder, request, typeStr);

        // 3. 정렬 및 페이징 (추천 점수 순)
        queryBuilder.addOrderAndPaging(request.getLimit());

        // 4. 쿼리 실행
        List<RecommendedFundingItemDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToRecommendedFundingItemDto,
                queryBuilder.getParams().toArray()
        );

        long total = countRecommendedFundings(userId, request, typeStr);
        
        // Pageable 생성 (커서 기반이지만 Spring Data 호환성을 위해)
        PageRequest pageable = PageRequest.of(0, request.getLimit());
        return new PageImpl<>(results, pageable, total);
    }

    /**
     * 추천 펀딩/투표 목록의 총 개수를 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param request 추천 펀딩 목록 조회 요청
     * @param typeStr 타입 필터 문자열
     * @return 총 개수
     */
    private Long countRecommendedFundings(Long userId, RecommendedFundingRequestDto request, String typeStr) {
        RecommendedQueryBuilder queryBuilder = new RecommendedQueryBuilder();
        queryBuilder.buildCountQuery(userId);
        
        // 타입 필터만 적용 (커서는 카운트에 영향 없음)
        addTypeFilterToBuilder(queryBuilder, typeStr);

        return jdbcTemplate.queryForObject(
                queryBuilder.getSql(),
                Long.class,
                queryBuilder.getParams().toArray()
        );
    }

    /**
     * 추천 목록 조회를 위한 동적 조건을 추가합니다.
     */
    private void addRecommendedDynamicConditions(RecommendedQueryBuilder queryBuilder, RecommendedFundingRequestDto request, String typeStr) {
        // 펀딩 타입 필터
        addTypeFilterToBuilder(queryBuilder, typeStr);

        // 커서 조건 추가
        if (request.getCursor() != null) {
            queryBuilder.addCursorCondition(request.getCursor());
        }
    }

    /**
     * 타입 필터를 추가합니다.
     * - null 또는 "all": 전체 (FUNDING + VOTE)
     * - "funding": FUNDING만
     * - "vote": VOTE만
     */
    private void addTypeFilterToBuilder(RecommendedQueryBuilder queryBuilder, String typeStr) {
        if (typeStr == null || "all".equalsIgnoreCase(typeStr)) {
            // 전체: FUNDING + VOTE
            queryBuilder.addFundingTypeFilter(FundingType.FUNDING, FundingType.VOTE);
        } else if ("funding".equalsIgnoreCase(typeStr)) {
            queryBuilder.addFundingTypeFilter(FundingType.FUNDING);
        } else if ("vote".equalsIgnoreCase(typeStr)) {
            queryBuilder.addFundingTypeFilter(FundingType.VOTE);
        }
    }

    /**
     * 추천 점수를 계산합니다.
     * 성공 가능성 기반: 달성률(0.5) + 보고싶어요(0.3) + 조회수(0.2)
     */
    private Double calculateRecommendationScore(int progressRate, int favoriteCount, int viewCount) {
        // 전체 데이터베이스의 합계 조회
        int totalFavoriteCount = getTotalFavoriteCount();
        int totalViewCount = getTotalViewCount();
        
        // 달성률 점수 (0-1)
        double progressScore = Math.min(progressRate / 100.0, 1.0);
        
        // 보고싶어요 점수 (0-1) - 전체 데이터베이스 합계 기준으로 정규화
        double favoriteScore = totalFavoriteCount > 0 ? Math.min(favoriteCount / (double) totalFavoriteCount, 1.0) : 0.0;
        
        // 조회수 점수 (0-1) - 전체 데이터베이스 합계 기준으로 정규화
        double viewScore = totalViewCount > 0 ? Math.min(viewCount / (double) totalViewCount, 1.0) : 0.0;
        
        // 가중치 적용
        double score = (progressScore * PROGRESS_RATE_WEIGHT) + 
                      (favoriteScore * FAVORITE_WEIGHT) + 
                      (viewScore * VIEW_WEIGHT);
        
        // 소수점 아래 3자리까지만 반올림
        return Math.round(score * 1000.0) / 1000.0;
    }

    /**
     * 전체 데이터베이스에서 좋아요 수의 합계를 조회합니다.
     */
    private int getTotalFavoriteCount() {
        Integer totalCount = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(favorite_count), 0) FROM funding_stats",
                Integer.class
        );
        return totalCount != null ? totalCount : 0;
    }

    /**
     * 전체 데이터베이스에서 조회수의 합계를 조회합니다.
     */
    private int getTotalViewCount() {
        Integer totalCount = jdbcTemplate.queryForObject(
                "SELECT COALESCE(SUM(view_count), 0) FROM funding_stats",
                Integer.class
        );
        return totalCount != null ? totalCount : 0;
    }

    /**
     * 추천 펀딩 아이템 DTO로 매핑합니다.
     */
    private RecommendedFundingItemDto mapToRecommendedFundingItemDto(ResultSet rs, int rowNum) throws SQLException {
        String fundingType = rs.getString("funding_type");
        FundingType type = FundingType.valueOf(fundingType);
        
        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int viewCount = rs.getInt("view_count");
        int price = rs.getInt("price");
        Integer perPersonPrice = (maxPeople > 0) ? price / maxPeople : -1;
        Long categoryId = rs.getLong("category_id");

        // 좋아요 여부
        boolean isLiked = rs.getBoolean("is_liked");

        // 추천 점수 계산
        Double recommendationScore = calculateRecommendationScore(progressRate, favoriteCount, viewCount);

        RecommendedFundingItemDto.BriefFundingInfo funding = RecommendedFundingItemDto.BriefFundingInfo.builder()
                .fundingId(rs.getLong("funding_id"))
                .title(rs.getString("title"))
                .summary(rs.getString("summary"))
                .bannerUrl(rs.getString("banner_url"))
                .state(rs.getString("state"))
                .progressRate(progressRate)
                .fundingEndsOn(rs.getString("ends_on"))
                .screenDate(rs.getString("screen_day"))
                .screenMinDate(rs.getString("screen_min_date"))
                .screenMaxDate(rs.getString("screen_max_date"))
                .price(perPersonPrice)
                .maxPeople(maxPeople)
                .participantCount(participantCount)
                .isLiked(isLiked)
                .favoriteCount(favoriteCount)
                .viewCount(viewCount)
                .build();

        RecommendedFundingItemDto.BriefCinemaInfo cinema = RecommendedFundingItemDto.BriefCinemaInfo.builder()
                .cinemaId(rs.getLong("cinema_id"))
                .cinemaName(rs.getString("cinema_name"))
                .city(rs.getString("city"))
                .district(rs.getString("district"))
                .build();

        MetadataDto metadata = MetadataDto.builder()
                .categoryId(categoryId)
                .recommendationScore(recommendationScore)
                .build();

        return RecommendedFundingItemDto.builder()
                .type(type)
                .funding(funding)
                .cinema(cinema)
                .metadata(metadata)
                .build();
    }

    // === Inner Class: RecommendedQueryBuilder ===
    private static class RecommendedQueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Long userId) {
            sql.append("""
                    SELECT f.funding_id, f.title, f.summary, f.banner_url, f.state, f.ends_on, f.screen_day,
                           f.funding_type, f.max_people, f.category_id, s.price,
                           c.cinema_id, c.cinema_name, c.city, c.district,
                           COALESCE(fs.participant_count, 0) as participant_count,
                           COALESCE(fs.favorite_count, 0) as favorite_count,
                           COALESCE(fs.view_count, 0) as view_count,
                           fed.min_date as screen_min_date,
                           fed.max_date as screen_max_date,
                           CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_liked
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN funding_estimate_days fed ON fed.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    WHERE f.leader_id != ?
                    """);

            // userId를 파라미터로 추가 (좋아요 조회용, 생성자 제외용)
            params.add(userId);
            params.add(userId);
        }

        public void buildCountQuery(Long userId) {
            sql.append("""
                    SELECT COUNT(DISTINCT f.funding_id)
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN funding_estimate_days fed ON fed.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    WHERE f.leader_id != ?
                    """);

            // userId를 파라미터로 추가
            params.add(userId);
            params.add(userId);
        }

        public void addFundingTypeFilter(FundingType... fundingTypes) {
            if (fundingTypes != null && fundingTypes.length > 0) {
                sql.append(" AND f.funding_type IN (");
                for (int i = 0; i < fundingTypes.length; i++) {
                    sql.append("?");
                    if (i < fundingTypes.length - 1) {
                        sql.append(",");
                    }
                    params.add(fundingTypes[i].name());
                }
                sql.append(")");
            }
        }

        public void addCursorCondition(Long cursor) {
            sql.append(" AND f.funding_id < ?");
            params.add(cursor);
        }

        public void addOrderAndPaging(Integer limit) {
            // 전체 데이터베이스의 합계를 기준으로 추천 점수 순 정렬 (내림차순)
            sql.append("""
                    ORDER BY 
                        (COALESCE(fs.participant_count, 0) * 100.0 / NULLIF(f.max_people, 0)) * 0.5 +
                        (COALESCE(fs.favorite_count, 0) / (SELECT COALESCE(SUM(fs2.favorite_count), 1) FROM funding_stats fs2)) * 0.3 +
                        (COALESCE(fs.view_count, 0) / (SELECT COALESCE(SUM(fs3.view_count), 1) FROM funding_stats fs3)) * 0.2 DESC,
                        f.funding_id DESC
                    LIMIT ?
                    """);
            params.add(limit);
        }

        public String getSql() {
            return sql.toString();
        }
    }
}
