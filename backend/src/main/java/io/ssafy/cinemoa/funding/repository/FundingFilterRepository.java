package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.category.repository.CategoryRepository;
import io.ssafy.cinemoa.cinema.enums.CinemaFeature;
import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.SearchRequest;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.funding.enums.FundingType;
import java.sql.Date;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class FundingFilterRepository {

    private final JdbcTemplate jdbcTemplate;
    private final CategoryRepository categoryRepository;

    public Page<CardTypeFundingInfoDto> findWithFilters(SearchRequest request, Pageable pageable) {
        // 1. 기본 쿼리 구성 (userId를 먼저 추가)
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildBaseQuery(request.getUserId()); // userId를 먼저 전달

        // 2. 동적 조건 추가
        addDynamicConditions(queryBuilder, request);

        // 3. 정렬 및 페이징
        queryBuilder.addOrderAndPaging(pageable);

        // 4. 쿼리 실행
        List<CardTypeFundingInfoDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToSearchResultDto,
                queryBuilder.getParams().toArray()
        );

        long total = countWithFilters(request);
        return new PageImpl<>(results, pageable, total);
    }

    private void addDynamicConditions(QueryBuilder queryBuilder, SearchRequest request) {
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
    }

    private Long countWithFilters(SearchRequest request) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildCountQuery(request.getUserId()); // userId 전달
        addDynamicConditions(queryBuilder, request);

        return jdbcTemplate.queryForObject(
                queryBuilder.getSql(),
                Long.class,
                queryBuilder.getParams().toArray()
        );
    }

    public Page<CardTypeFundingInfoDto> findFundingWithFilters(SearchRequest request, Pageable pageable) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildBaseQuery(request.getUserId());
        queryBuilder.addFundingTypeFilter(FundingType.FUNDING);  // INSTANT 고정
        addAllFiltersFromRequest(queryBuilder, request);  // 기존 필터들 모두 적용
        queryBuilder.addOrderAndPaging(pageable);

        List<CardTypeFundingInfoDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToSearchResultDto,
                queryBuilder.getParams().toArray()
        );

        long total = countInstantFundingsWithFilters(request);
        return new PageImpl<>(results, pageable, total);
    }

    public Page<CardTypeFundingInfoDto> findVotesWithFilters(SearchRequest request, Pageable pageable) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildBaseQuery(request.getUserId());
        queryBuilder.addFundingTypeFilter(FundingType.VOTE);  // VOTE 고정
        addAllFiltersFromRequest(queryBuilder, request);  // 기존 필터들 모두 적용
        queryBuilder.addOrderAndPaging(pageable);

        List<CardTypeFundingInfoDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToSearchResultDto,
                queryBuilder.getParams().toArray()

        );

        long total = countVoteFundingsWithFilters(request);
        return new PageImpl<>(results, pageable, total);
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
    }

    // INSTANT 펀딩 카운트 (필터 포함)
    private Long countInstantFundingsWithFilters(SearchRequest request) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildCountQuery(request.getUserId());
        queryBuilder.addFundingTypeFilter(FundingType.FUNDING);
        addAllFiltersFromRequest(queryBuilder, request);

        return jdbcTemplate.queryForObject(
                queryBuilder.getSql(),
                Long.class,
                queryBuilder.getParams().toArray()
        );
    }

    // VOTE 펀딩 카운트 (필터 포함)
    private Long countVoteFundingsWithFilters(SearchRequest request) {
        QueryBuilder queryBuilder = new QueryBuilder();
        queryBuilder.buildCountQuery(request.getUserId());
        queryBuilder.addFundingTypeFilter(FundingType.VOTE);
        addAllFiltersFromRequest(queryBuilder, request);

        return jdbcTemplate.queryForObject(
                queryBuilder.getSql(),
                Long.class,
                queryBuilder.getParams().toArray()
        );
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
                    WHERE 1=1
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

        public void addTheaterTypeFilter(CinemaFeature theaterType) {
            switch (theaterType) {
                case IMAX -> sql.append(" AND s.is_imax = true");
                case FDX -> sql.append(" AND s.is_4dx = true");
                case SCREENX -> sql.append(" AND s.is_screenx = true");
                case DOLBY -> sql.append(" AND s.is_dolby = true");
                case RECLINER -> sql.append(" AND s.is_recliner = true");
                case NORMAL -> sql.append("""
                         AND s.is_imax = false
                         AND s.is_screenx = false
                         AND s.is_4dx = false
                         AND s.is_dolby = false
                         AND s.is_recliner = false
                        """);
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
                sql.append(" AND f.state = 'CLOSED'");
            } else {
                sql.append(" AND f.state != 'CLOSED'");
            }
        }

        public void addOrderAndPaging(Pageable pageable) {
            sql.append(" ORDER BY f.created_at DESC LIMIT ? OFFSET ?");
            params.add(pageable.getPageSize());
            params.add(pageable.getOffset());
        }

        public String getSql() {
            return sql.toString();
        }
    }
}
