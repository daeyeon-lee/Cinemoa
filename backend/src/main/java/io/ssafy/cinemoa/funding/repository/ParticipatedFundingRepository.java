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

/**
 * 내가 참여한 목록 조회를 위한 Repository
 * <p>
 * API 경로: GET /api/user/{userId}/participated-funding
 */
@Repository
@RequiredArgsConstructor
public class ParticipatedFundingRepository {

    private final JdbcTemplate jdbcTemplate;

    /**
     * 내가 참여한 펀딩 목록을 조회합니다.
     *
     * @param userId  사용자 ID
     * @param state   참여 상태 필터 (ALL, ON_PROGRESS, CLOSE)
     * @param request 참여한 목록 조회 요청
     * @return 참여한 펀딩 목록
     */
    public CursorResponse<CardTypeFundingInfoDto> findParticipatedFundings(Long userId,
                                                                           String state,
                                                                           CursorRequestDto request) {
        // 1. 기본 쿼리 구성 (state 필터 포함)
        ParticipatedQueryBuilder queryBuilder = new ParticipatedQueryBuilder();
        queryBuilder.buildBaseQuery(userId, state);

        // 2. 커서 조건 추가
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
     * 커서 조건을 추가합니다.
     */
    private void addCursor(ParticipatedQueryBuilder queryBuilder, String cursor) {
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
     * 참여한 펀딩 아이템 DTO로 매핑합니다.
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
                .timestamp(rs.getTimestamp("participated_at").toLocalDateTime())
                .funding(funding)
                .cinema(cinema)
                .build();
    }

    // === Inner Class: ParticipatedQueryBuilder ===
    private static class ParticipatedQueryBuilder {
        private final StringBuilder sql = new StringBuilder();
        @Getter
        private final List<Object> params = new ArrayList<>();

        public void buildBaseQuery(Long userId, String state) {
            sql.append("""
                    SELECT f.funding_id, f.title, f.summary, f.banner_url, f.state, f.ends_on, f.screen_day,
                           f.funding_type, f.max_people, f.video_name, s.price,
                           c.cinema_id, c.cinema_name, c.city, c.district,
                           COALESCE(fs.participant_count, 0) as participant_count,
                           COALESCE(fs.favorite_count, 0) as favorite_count,
                           CASE WHEN uf.user_id IS NOT NULL THEN true ELSE false END as is_liked,
                           t.created_at as participated_at
                    FROM fundings f
                    LEFT JOIN cinemas c ON f.cinema_id = c.cinema_id
                    LEFT JOIN screens s ON f.screen_id = s.screen_id
                    LEFT JOIN funding_stats fs ON fs.funding_id = f.funding_id
                    LEFT JOIN user_favorites uf ON uf.funding_id = f.funding_id AND uf.user_id = ?
                    INNER JOIN user_transactions t ON t.funding_id = f.funding_id AND t.user_id = ? AND t.state = 'SUCCESS'
                    WHERE f.leader_id != ? AND f.funding_type = 'FUNDING'
                    """);

            // userId를 파라미터로 추가 (좋아요 조회용, 참여자 조회용, 생성자 제외용)
            params.add(userId);
            params.add(userId);
            params.add(userId);

            // state 필터 조건 추가
            if (state != null && !state.equals("ALL")) {
                switch (state) {
                    case "ON_PROGRESS":
                        // 진행 중인 펀딩 (ON_PROGRESS, WAITING)
                        sql.append(" AND f.state IN (?, ?)");
                        params.add("ON_PROGRESS");
                        params.add("WAITING");
                        break;
                    case "CLOSE":
                        // 완료된 펀딩 (FAILED, SUCCESS)
                        sql.append(" AND f.state IN (?, ?)");
                        params.add("FAILED");
                        params.add("SUCCESS");
                        break;
                    default:
                        // 잘못된 state 값인 경우 예외 발생
                        throw new BadRequestException("잘못된 상태 필터입니다. (ALL, ON_PROGRESS, CLOSE 중 하나를 선택하세요)", ResourceCode.INPUT);
                }
            }
        }


        public void addCursorCondition(TimestampCursorInfo cursorInfo) {
            sql.append("""
                    AND (t.created_at < ? OR (t.created_at = ? AND f.funding_id < ?))
                    """);
            params.add(cursorInfo.getCreatedAt());
            params.add(cursorInfo.getCreatedAt());
            params.add(cursorInfo.getFundingId());
        }

        public void addOrderAndLimit(Integer limit) {
            sql.append(" ORDER BY t.created_at DESC, f.funding_id DESC LIMIT ?");
            params.add(limit);
        }

        public String getSql() {
            return sql.toString();
        }
    }
}
