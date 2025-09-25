package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.category.repository.CategoryRepository;
import io.ssafy.cinemoa.cinema.enums.CinemaFeature;
import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.dto.TimestampCursorInfo;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.response.CursorResponse;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FundingFilterRepository {

    private final JdbcTemplate jdbcTemplate;
    private final CategoryRepository categoryRepository;

    public CursorResponse<CardTypeFundingInfoDto> findLatestWithFilters(SearchRequest request) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildBaseQuery(request.getUserId());
        addAllFiltersFromRequest(queryBuilder, request);

        // 커서 조건 추가
        if (request.getNextCursor() != null) {
            TimestampCursorInfo cursorInfo = parseCursor(request.getNextCursor());
            queryBuilder.addCursorCondition(cursorInfo);
        }

        int limit = 16;

        queryBuilder.addOrderLatest();
        queryBuilder.addLimit(limit + 1);

        List<CardTypeFundingInfoDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToSearchResultDto,
                queryBuilder.getParams().toArray()
        );

        boolean hasNextPage = results.size() > limit;

        String nextCursor = null;

        if (hasNextPage) {
            results.remove(results.size() - 1); // 마지막 항목 제거
            CardTypeFundingInfoDto last = results.get(results.size() - 1);
            nextCursor = createCursor(last.getTimestamp(), last.getFunding().getFundingId());
        }

        return CursorResponse.<CardTypeFundingInfoDto>builder()
                .content(results)
                .nextCursor(nextCursor)
                .hasNextPage(hasNextPage)
                .build();
    }

    public CursorResponse<CardTypeFundingInfoDto> findRecommendedWithFilters(SearchRequest request) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildBaseQuery(request.getUserId());
        addAllFiltersFromRequest(queryBuilder, request);
        queryBuilder.addOrderRecommended();
        queryBuilder.addLimit(100);

        List<CardTypeFundingInfoDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToSearchResultDto,
                queryBuilder.getParams().toArray()
        );

        return CursorResponse.<CardTypeFundingInfoDto>builder()
                .content(results)
                .nextCursor(null)      // Top 100이므로 커서 없음
                .hasNextPage(false)    // 더 이상 데이터 없음
                .build();
    }

    // 인기순 - Top 100 일괄 전송
    public CursorResponse<CardTypeFundingInfoDto> findPopularWithFilters(SearchRequest request) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildBaseQuery(request.getUserId());
        addAllFiltersFromRequest(queryBuilder, request);
        queryBuilder.addOrderPopular();
        queryBuilder.addLimit(100);

        List<CardTypeFundingInfoDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToSearchResultDto,
                queryBuilder.getParams().toArray()
        );

        return CursorResponse.<CardTypeFundingInfoDto>builder()
                .content(results)
                .nextCursor(null)
                .hasNextPage(false)
                .build();
    }


    // 공통 필터 적용 메서드
    private void addAllFiltersFromRequest(QueryBuilder queryBuilder, SearchRequest request) {
        // 검색어
        if (hasText(request.getQ())) {
            queryBuilder.addSearchCondition(request.getQ());
        }

        // 지역 필터
        if (hasRegions(request.getRegion())) {
            queryBuilder.addRegionFilter(request.getRegion());
        }

        // 극장 타입 필터
        if (request.getTheaterType() != null) {
            queryBuilder.addTheaterTypeFilter(request.getTheaterType());
        }

        // 종료 여부 필터
        if (request.getIsClosed() != null) {
            queryBuilder.addClosedFilter(request.getIsClosed());
        }

        if (request.getCategory() != null) {
            queryBuilder.addCategoryFilter(request.getCategory(), categoryRepository);
        }

        if (request.getFundingType() != null) {
            queryBuilder.addFundingTypeFilter(request.getFundingType());
        }
    }

    private String createCursor(LocalDateTime createdAt, Long id) {
        String cursorData = createdAt + "_" + id;
        return Base64.getEncoder().encodeToString(cursorData.getBytes(StandardCharsets.UTF_8));
    }

    private TimestampCursorInfo parseCursor(String cursor) {
        String decoded = new String(Base64.getDecoder().decode(cursor));
        String[] parts = decoded.split("_");

        if (parts.length < 2) {
            throw new BadRequestException("커서가 잘못되었습니다.", ResourceCode.INPUT);
        }

        LocalDateTime timestamp = LocalDateTime.parse(parts[0]);
        Long fundingId = Long.parseLong(parts[1]);

        return new TimestampCursorInfo(timestamp, fundingId);
    }

    private CardTypeFundingInfoDto mapToSearchResultDto(ResultSet rs, int rowNum) throws SQLException {
        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int price = rs.getInt("price");
        Integer perPersonPrice = (maxPeople > 0) ? price / maxPeople : -1;
        String fundingType = rs.getString("funding_type");

        // 좋아요 여부 추가
        boolean isLiked = rs.getBoolean("is_liked");

        CardTypeFundingInfoDto.BriefFundingInfo funding = CardTypeFundingInfoDto.BriefFundingInfo.builder()
                .fundingId(rs.getLong("funding_id"))
                .title(rs.getString("title"))
                .bannerUrl(rs.getString("banner_url"))
                .state(FundingState.valueOf(rs.getString("state")))
                .progressRate(progressRate)
                .fundingEndsOn(toLocalDate(rs.getDate("ends_on")))
                .screenDate(toLocalDate(rs.getDate("screen_day")))
                .price(perPersonPrice)
                .videoName(rs.getString("video_name"))
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

        return CardTypeFundingInfoDto.builder()
                .cinema(cinema)
                .funding(funding)
                .timestamp(rs.getTimestamp("created_at").toLocalDateTime())
                .build();
    }

    // === Helper Methods ===
    private boolean hasText(String text) {
        return text != null && !text.trim().isEmpty();
    }

    private boolean hasRegions(List<String> regions) {
        return regions != null && !regions.isEmpty();
    }

    private LocalDate toLocalDate(Date date) {
        return date != null ? date.toLocalDate() : null;
    }

    // === Inner Class: QueryBuilder ===
    private static class QueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Long userId) {
            sql.append("""
                    SELECT f.funding_id, f.title, f.banner_url, f.state, f.ends_on, f.screen_day,
                           f.funding_type,f.max_people, f.video_name, s.price,
                           c.cinema_id, c.cinema_name, c.city, c.district,
                           COALESCE(fs.participant_count, 0) as participant_count,
                           COALESCE(fs.favorite_count, 0) as favorite_count,
                           CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                           f.created_at
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    WHERE 1=1
                    """);

            // userId를 첫 번째 파라미터로 추가 (null인 경우 -1로 처리)
            params.add(userId != null ? userId : -1L);
        }

        public void buildCountQuery(Long userId) {
            sql.append("""
                    SELECT COUNT(DISTINCT f.funding_id)
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    WHERE 1=1 AND f.state == 'ON_PROGRESS'
                    """);

            // userId를 첫 번째 파라미터로 추가
            params.add(userId != null ? userId : -1L);
        }

        public void addSearchCondition(String query) {
            sql.append(" AND (LOWER(f.title) LIKE LOWER(?) OR LOWER(f.video_name) LIKE LOWER(?))");
            String searchPattern = "%" + query + "%";
            params.add(searchPattern);
            params.add(searchPattern);
        }

        public void addRegionFilter(List<String> regions) {
            String placeholders = regions.stream()
                    .map(r -> "?")
                    .collect(Collectors.joining(","));
            sql.append(" AND c.district IN (").append(placeholders).append(")");
            params.addAll(regions);
        }

        public void addCategoryFilter(Long categoryId, CategoryRepository categoryRepository) {
            boolean isParent = categoryRepository.isParent(categoryId);

            if (isParent) {
                List<Long> childIds = categoryRepository.findSubCategoryIdsByParentId(categoryId);

                if (!childIds.isEmpty()) {
                    StringBuilder sb = new StringBuilder();
                    for (int idx = 0; idx < childIds.size(); ++idx) {
                        if (idx > 0) {
                            sb.append(",");
                        }
                        sb.append("?");
                    }
                    sql.append(" AND f.category_id IN(").append(sb).append(")");
                    params.addAll(childIds);
                }
                return;
            }

            sql.append(" AND f.category_id = ?");
            params.add(categoryId);
        }

        public void addTheaterTypeFilter(Set<CinemaFeature> theaterTypes) {
            if (theaterTypes == null || theaterTypes.isEmpty()) {
                return;
            }

            List<String> conditions = new ArrayList<>();

            for (CinemaFeature type : theaterTypes) {
                switch (type) {
                    case IMAX -> conditions.add("s.is_imax = true");
                    case FDX -> conditions.add("s.is_4dx = true");
                    case SCREENX -> conditions.add("s.is_screenx = true");
                    case DOLBY -> conditions.add("s.is_dolby = true");
                    case RECLINER -> conditions.add("s.is_recliner = true");
                    case NORMAL -> conditions.add("""
                            (s.is_imax = false AND s.is_screenx = false
                             AND s.is_4dx = false AND s.is_dolby = false 
                             AND s.is_recliner = false)
                            """);
                }
            }

            if (!conditions.isEmpty()) {
                sql.append(" AND (")
                        .append(String.join(" OR ", conditions))
                        .append(")");
            }
        }

        public void addFundingTypeFilter(FundingType fundingType) {
            if (fundingType != null) {
                sql.append(" AND f.funding_type = ?");
                params.add(fundingType.name());
            }
        }

        public void addClosedFilter(Boolean isClosed) {
            if (isClosed) {
                sql.append(" AND (f.state == 'FAILED' OR f.state != 'SUCCESS')");
            }
        }

        public void addCursorCondition(TimestampCursorInfo cursorInfo) {

            Long cursorId = cursorInfo.getFundingId();
            LocalDateTime cursorCreatedAt = cursorInfo.getCreatedAt();

            if (cursorId != null && cursorCreatedAt != null) {
                sql.append(" AND (f.created_at < ? OR (f.created_at = ? AND f.funding_id < ?))");
                params.add(cursorCreatedAt);
                params.add(cursorCreatedAt);
                params.add(cursorId);
            }
        }

        public void addOrderLatest() {
            sql.append(" ORDER BY f.created_at DESC, f.funding_id DESC");
        }

        public void addOrderRecommended() {
            sql.append(" ORDER BY COALESCE(fs.recommend_score, 0) DESC, f.created_at DESC");
        }

        public void addOrderPopular() {
            sql.append(" ORDER BY COALESCE(fs.view_count, 0) DESC, f.created_at DESC");
        }

        public String getSql() {
            return sql.toString();
        }

        public void addLimit(int i) {
            sql.append(" LIMIT ?");
            params.add(i);
        }
    }
}
