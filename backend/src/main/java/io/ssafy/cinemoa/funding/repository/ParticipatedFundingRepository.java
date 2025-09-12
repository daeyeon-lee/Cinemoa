package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.dto.ParticipatedFundingRequest;
import io.ssafy.cinemoa.funding.dto.ParticipatedFundingItemDto;
import io.ssafy.cinemoa.funding.enums.FundingState;
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
 * 내가 참여한 목록 조회를 위한 Repository
 * 
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@Repository
@RequiredArgsConstructor
public class ParticipatedFundingRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 내가 참여한 펀딩 목록을 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param request 참여한 목록 조회 요청
     * @param stateStr 상태 필터 문자열
     * @return 참여한 펀딩 목록
     */
    public Page<ParticipatedFundingItemDto> findParticipatedFundings(Long userId, ParticipatedFundingRequest request, String stateStr) {
        // 1. 기본 쿼리 구성
        ParticipatedQueryBuilder queryBuilder = new ParticipatedQueryBuilder();
        queryBuilder.buildBaseQuery(userId);

        // 2. 동적 조건 추가 (커서와 상태 필터)
        addParticipatedDynamicConditions(queryBuilder, request, stateStr);

        // 3. 정렬 및 페이징 (커서 기반)
        queryBuilder.addOrderAndPaging(request.getLimit());

        // 4. 쿼리 실행
        List<ParticipatedFundingItemDto> results = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToParticipatedFundingItemDto,
                queryBuilder.getParams().toArray()
        );

        long total = countParticipatedFundings(userId, request, stateStr);
        
        // Pageable 생성 (커서 기반이지만 Spring Data 호환성을 위해)
        PageRequest pageable = PageRequest.of(0, request.getLimit());
        return new PageImpl<>(results, pageable, total);
    }

    /**
     * 내가 참여한 펀딩 목록의 총 개수를 조회합니다.
     * 
     * @param userId 사용자 ID
     * @param request 참여한 목록 조회 요청
     * @param stateStr 상태 필터 문자열
     * @return 총 개수
     */
    private Long countParticipatedFundings(Long userId, ParticipatedFundingRequest request, String stateStr) {
        ParticipatedQueryBuilder queryBuilder = new ParticipatedQueryBuilder();
        queryBuilder.buildCountQuery(userId);
        
        // 상태 필터만 적용 (커서는 카운트에 영향 없음)
        addStateFilterToBuilder(queryBuilder, stateStr);

        return jdbcTemplate.queryForObject(
                queryBuilder.getSql(),
                Long.class,
                queryBuilder.getParams().toArray()
        );
    }

    /**
     * 참여한 목록 조회를 위한 동적 조건을 추가합니다.
     */
    private void addParticipatedDynamicConditions(ParticipatedQueryBuilder queryBuilder, ParticipatedFundingRequest request, String stateStr) {
        // 펀딩 타입 필터 (FUNDING만)
        queryBuilder.addFundingTypeFilter(FundingType.FUNDING);

        // 커서 조건 추가
        if (request.getCursor() != null) {
            queryBuilder.addCursorCondition(request.getCursor());
        }

        // 상태 필터 (요구사항에 따른 복합 조건)
        addStateFilterToBuilder(queryBuilder, stateStr);
    }

    /**
     * 요구사항에 따른 상태 필터를 추가합니다.
     * - ALL 또는 null: ON_PROGRESS + SUCCESS + FAILED (진행중 + 종료된 것들)
     * - ON_PROGRESS: ON_PROGRESS만
     * - CLOSE: SUCCESS + FAILED (성공 또는 실패한 것들)
     */
    private void addStateFilterToBuilder(ParticipatedQueryBuilder queryBuilder, String stateStr) {
        if (stateStr == null || "ALL".equalsIgnoreCase(stateStr)) {
            // ALL: 진행중 + 종료된 것들
            queryBuilder.addStateFilter(FundingState.ON_PROGRESS, FundingState.SUCCESS, FundingState.FAILED);
        } else if ("ON_PROGRESS".equalsIgnoreCase(stateStr)) {
            queryBuilder.addStateFilter(FundingState.ON_PROGRESS);
        } else if ("CLOSE".equalsIgnoreCase(stateStr)) {
            // CLOSE: 성공 또는 실패한 것들
            queryBuilder.addStateFilter(FundingState.SUCCESS, FundingState.FAILED);
        } else {
            // 기타 상태들 (SUCCESS, FAILED, EVALUATING, REJECTED, WAITING, VOTING)
            try {
                FundingState state = FundingState.valueOf(stateStr.toUpperCase());
                queryBuilder.addStateFilter(state);
            } catch (IllegalArgumentException e) {
                // 지원하지 않는 상태값
                throw new IllegalArgumentException("지원하지 않는 state 값입니다: " + stateStr);
            }
        }
    }

    /**
     * 참여한 펀딩 아이템 DTO로 매핑합니다.
     */
    private ParticipatedFundingItemDto mapToParticipatedFundingItemDto(ResultSet rs, int rowNum) throws SQLException {
        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int price = rs.getInt("price");
        Integer perPersonPrice = (maxPeople > 0) ? price / maxPeople : -1;
        String fundingType = rs.getString("funding_type");

        // 좋아요 여부
        boolean isLiked = rs.getBoolean("is_liked");

        ParticipatedFundingItemDto.BriefFundingInfo funding = ParticipatedFundingItemDto.BriefFundingInfo.builder()
                .fundingId(rs.getLong("funding_id"))
                .title(rs.getString("title"))
                .bannerUrl(rs.getString("banner_url"))
                .state(rs.getString("state"))
                .progressRate(progressRate)
                .fundingEndsOn(rs.getString("ends_on"))
                .screenDate(rs.getString("screen_day"))
                .price(perPersonPrice)
                .maxPeople(maxPeople)
                .participantCount(participantCount)
                .isLiked(isLiked)
                .favoriteCount(favoriteCount)
                .fundingType(fundingType)
                .build();

        ParticipatedFundingItemDto.BriefCinemaInfo cinema = ParticipatedFundingItemDto.BriefCinemaInfo.builder()
                .cinemaId(rs.getLong("cinema_id"))
                .cinemaName(rs.getString("cinema_name"))
                .city(rs.getString("city"))
                .district(rs.getString("district"))
                .build();

        return new ParticipatedFundingItemDto(funding, cinema);
    }

    // === Inner Class: ParticipatedQueryBuilder ===
    private static class ParticipatedQueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Long userId) {
            sql.append("""
                    SELECT f.funding_id, f.title, f.banner_url, f.state, f.ends_on, f.screen_day,
                           f.funding_type, f.max_people, s.price,
                           c.cinema_id, c.cinema_name, c.city, c.district,
                           COALESCE(fs.participant_count, 0) as participant_count,
                           COALESCE(fs.favorite_count, 0) as favorite_count,
                           CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_liked
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    INNER JOIN transactions t ON t.funding_id = f.funding_id AND t.user_id = ? AND t.state = 'SUCCESS'
                    WHERE f.leader_id != ?
                    """);

            // userId를 파라미터로 추가 (좋아요 조회용, 참여자 조회용, 생성자 제외용)
            params.add(userId);
            params.add(userId);
            params.add(userId);
        }

        public void buildCountQuery(Long userId) {
            sql.append("""
                    SELECT COUNT(DISTINCT f.funding_id)
                    FROM fundings f
                    INNER JOIN transactions t ON t.funding_id = f.funding_id AND t.user_id = ? AND t.state = 'SUCCESS'
                    WHERE f.leader_id != ?
                    """);

            // userId를 파라미터로 추가
            params.add(userId);
            params.add(userId);
        }

        public void addFundingTypeFilter(FundingType fundingType) {
            if (fundingType != null) {
                sql.append(" AND f.funding_type = ?");
                params.add(fundingType.name());
            }
        }

        public void addCursorCondition(Long cursor) {
            sql.append(" AND f.funding_id < ?");
            params.add(cursor);
        }

        public void addStateFilter(FundingState... states) {
            if (states != null && states.length > 0) {
                sql.append(" AND f.state IN (");
                for (int i = 0; i < states.length; i++) {
                    sql.append("?");
                    if (i < states.length - 1) {
                        sql.append(",");
                    }
                    params.add(states[i].name());
                }
                sql.append(")");
            }
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
