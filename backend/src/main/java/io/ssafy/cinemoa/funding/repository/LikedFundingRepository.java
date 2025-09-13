package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.dto.LikedFundingRequestDto;
import io.ssafy.cinemoa.funding.dto.LikedFundingItemDto;
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
 * 보고싶어요 한 목록 조회를 위한 Repository
 * 
 * API 경로: GET /api/user/{userId}/like
 */
@Repository
@RequiredArgsConstructor
public class LikedFundingRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 보고싶어요 한 펀딩/투표 목록을 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param request 보고싶어요 목록 조회 요청
     * @param typeStr 타입 필터 문자열 (funding, vote)
     * @return 보고싶어요 한 펀딩/투표 목록
     */
    public Page<LikedFundingItemDto> findLikedFundings(Long userId, LikedFundingRequestDto request, String typeStr) {
        // 1. 기본 쿼리 구성
        LikedQueryBuilder queryBuilder = new LikedQueryBuilder();
        queryBuilder.buildBaseQuery(userId);

        // 2. 동적 조건 추가 (커서와 타입 필터)
        addLikedDynamicConditions(queryBuilder, request, typeStr);

        // 3. 정렬 및 페이징 (커서 기반)
        queryBuilder.addOrderAndPaging(request.getLimit());

        // 4. 쿼리 실행
        List<LikedFundingItemDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToLikedFundingItemDto,
                queryBuilder.getParams().toArray()
        );

        long total = countLikedFundings(userId, request, typeStr);
        
        // Pageable 생성 (커서 기반이지만 Spring Data 호환성을 위해)
        PageRequest pageable = PageRequest.of(0, request.getLimit());
        return new PageImpl<>(results, pageable, total);
    }

    /**
     * 보고싶어요 한 펀딩/투표 목록의 총 개수를 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param request 보고싶어요 목록 조회 요청
     * @param typeStr 타입 필터 문자열
     * @return 총 개수
     */
    private Long countLikedFundings(Long userId, LikedFundingRequestDto request, String typeStr) {
        LikedQueryBuilder queryBuilder = new LikedQueryBuilder();
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
     * 보고싶어요 목록 조회를 위한 동적 조건을 추가합니다.
     */
    private void addLikedDynamicConditions(LikedQueryBuilder queryBuilder, LikedFundingRequestDto request, String typeStr) {
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
    private void addTypeFilterToBuilder(LikedQueryBuilder queryBuilder, String typeStr) {
        if (typeStr == null || "all".equalsIgnoreCase(typeStr)) {
            // 전체: FUNDING + VOTE
            queryBuilder.addFundingTypeFilter(FundingType.FUNDING, FundingType.VOTE);
        } else if ("funding".equalsIgnoreCase(typeStr)) {
            queryBuilder.addFundingTypeFilter(FundingType.FUNDING);
        } else if ("vote".equalsIgnoreCase(typeStr)) {
            queryBuilder.addFundingTypeFilter(FundingType.VOTE);
        } else {
            // 지원하지 않는 타입
            throw new IllegalArgumentException("지원하지 않는 type 값입니다: " + typeStr);
        }
    }

    /**
     * 보고싶어요 한 펀딩 아이템 DTO로 매핑합니다.
     */
    private LikedFundingItemDto mapToLikedFundingItemDto(ResultSet rs, int rowNum) throws SQLException {
        String fundingType = rs.getString("funding_type");
        FundingType type = FundingType.valueOf(fundingType);
        
        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int price = rs.getInt("price");
        Integer perPersonPrice = (maxPeople > 0) ? price / maxPeople : -1;

        // 좋아요 여부 (항상 true)
        boolean isLiked = true;

        LikedFundingItemDto.BriefFundingInfo funding = LikedFundingItemDto.BriefFundingInfo.builder()
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
                .build();

        LikedFundingItemDto.BriefCinemaInfo cinema = LikedFundingItemDto.BriefCinemaInfo.builder()
                .cinemaId(rs.getLong("cinema_id"))
                .cinemaName(rs.getString("cinema_name"))
                .city(rs.getString("city"))
                .district(rs.getString("district"))
                .build();

        return LikedFundingItemDto.builder()
                .type(type)
                .funding(funding)
                .cinema(cinema)
                .build();
    }

    // === Inner Class: LikedQueryBuilder ===
    private static class LikedQueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Long userId) {
            sql.append("""
                    SELECT f.funding_id, f.title, f.summary, f.banner_url, f.state, f.ends_on, f.screen_day,
                           f.funding_type, f.max_people, s.price,
                           c.cinema_id, c.cinema_name, c.city, c.district,
                           COALESCE(fs.participant_count, 0) as participant_count,
                           COALESCE(fs.favorite_count, 0) as favorite_count,
                           fed.min_date as screen_min_date,
                           fed.max_date as screen_max_date
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN funding_estimate_days fed ON fed.funding_id = f.funding_id
                    INNER JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
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
                    INNER JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
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
            sql.append(" ORDER BY f.funding_id DESC LIMIT ?");
            params.add(limit);
        }

        public String getSql() {
            return sql.toString();
        }
    }
}