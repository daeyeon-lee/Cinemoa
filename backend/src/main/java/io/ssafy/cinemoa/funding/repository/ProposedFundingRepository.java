package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.dto.CardTypeFundingInfoDto;
import io.ssafy.cinemoa.funding.dto.CursorRequestDto;
import io.ssafy.cinemoa.funding.dto.TimestampCursorInfo;
import io.ssafy.cinemoa.funding.enums.FundingState;
import io.ssafy.cinemoa.global.enums.ResourceCode;
import io.ssafy.cinemoa.global.exception.BadRequestException;
import io.ssafy.cinemoa.global.response.CursorResponse;
import java.nio.charset.StandardCharsets;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ProposedFundingRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 내가 제안한 펀딩 목록을 조회합니다.
     *
     * @param userId  사용자 ID
     * @param request 제안한 목록 조회 요청
     * @return 제안한 펀딩 목록
     */
    public CursorResponse<CardTypeFundingInfoDto> findProposedFundings(Long userId, CursorRequestDto request) {
        // 1. 기본 쿼리 구성
        ProposedQueryBuilder queryBuilder = new ProposedQueryBuilder();
        queryBuilder.buildBaseQuery(userId);

        // 2. 동적 조건 추가 (커서와 상태 필터)
        addCursor(queryBuilder, request.getCursor());

        // 3. 정렬 및 페이징 (커서 기반)
        queryBuilder.addOrderAndLimit(request.getLimit() + 1);

        // 4. 쿼리 실행
        List<CardTypeFundingInfoDto> result = jdbcTemplate.query(
                queryBuilder.getSql(),
                this::mapToCardTypeFundingInfoDto,
                queryBuilder.getParams().toArray()
        );

        boolean hasNext = result.size() > request.getLimit();

        if (hasNext) {
            result.remove(result.size() - 1);
        }

        String nextCursor = null;

        if (hasNext && !result.isEmpty()) {
            CardTypeFundingInfoDto last = result.get(result.size() - 1);
            nextCursor = createCursor(last.getTimestamp(), last.getFunding().getFundingId());
        }

        return CursorResponse.<CardTypeFundingInfoDto>builder()
                .hasNextPage(hasNext)
                .content(result)
                .nextCursor(nextCursor)
                .build();
    }

    /**
     * 제안 목록 조회를 위한 커서 조건을 추가합니다.
     */
    private void addCursor(ProposedQueryBuilder queryBuilder, String cursor) {
        if (cursor == null) {
            return;
        }
        // 커서 조건 추가
        queryBuilder.addCursorCondition(parseCursor(cursor));
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

    /**
     * 제안한 펀딩 아이템 DTO로 매핑합니다.
     */
    private CardTypeFundingInfoDto mapToCardTypeFundingInfoDto(ResultSet rs, int rowNum) throws SQLException {
        int participantCount = rs.getInt("participant_count");
        int maxPeople = rs.getInt("max_people");
        int progressRate = maxPeople > 0 ? (participantCount * 100 / maxPeople) : 0;
        int favoriteCount = rs.getInt("favorite_count");
        int price = rs.getInt("price");
        Integer perPersonPrice = (maxPeople > 0) ? price / maxPeople : -1;
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

    // === Inner Class: ProposedQueryBuilder ===
    private static class ProposedQueryBuilder {
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
                           CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                           f.created_at as timestamp
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    WHERE f.leader_id = ? AND f.funding_type = 'FUNDING'
                    """);

            // userId를 파라미터로 추가 (좋아요 조회용, 제안자 조회용)
            params.add(userId);
            params.add(userId);
        }

        public void addCursorCondition(TimestampCursorInfo cursorInfo) {
            sql.append("""
                    AND (f.created_at < ? OR (f.created_at = ? AND f.funding_id < ?))
                    """);
            params.add(cursorInfo.getCreatedAt());
            params.add(cursorInfo.getCreatedAt());
            params.add(cursorInfo.getFundingId());
        }

        public void addOrderAndLimit(Integer limit) {
            sql.append(" ORDER BY f.created_at DESC, f.funding_id DESC LIMIT ?");
            params.add(limit);
        }

        public String getSql() {
            return sql.toString();
        }
    }
}
