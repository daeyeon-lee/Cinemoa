package io.ssafy.cinemoa.funding.repository;

import io.ssafy.cinemoa.funding.repository.entity.Funding;
import java.util.Optional;
import io.ssafy.cinemoa.funding.enums.FundingType;
import io.ssafy.cinemoa.funding.enums.FundingState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 내가 제안한 목록 조회 : 핵심 조회 로직 (관련 api : /api/user/{userId}/funding-proposals)
 *
 * @author sara
 */
@Repository
public interface FundingRepository extends JpaRepository<Funding, Long> {

    // --- 커서가 없을 때 (첫 페이지) ---

    /**
     * 특정 사용자가 제안한 특정 타입의 펀딩 목록을 펀딩 ID 내림차순으로 조회합니다.
     *
     * @param leaderId    사용자 ID
     * @param fundingType 펀딩 타입
     * @param pageable    페이지 정보
     * @return 펀딩 목록 페이지
     * @author sara
     */
    Page<Funding> findByLeader_IdAndFundingTypeOrderByFundingIdDesc(Long leaderId, FundingType fundingType,
            Pageable pageable);

    /**
     * 특정 사용자가 제안한 전체 펀딩 목록을 펀딩 ID 내림차순으로 조회합니다.
     *
     * @param fundingId 펀딩 ID
     * @return 펀딩 계좌 번호
     * @author HG
     */
    @Query("SELECT f.fundingAccount FROM Funding f WHERE f.fundingId = :fundingId")
    Optional<String> findFundingAccountByFundingId(@Param("fundingId") Long fundingId);

    /**
     * 특정 날짜에 마감되고 특정 상태인 펀딩들을 조회합니다.
     *
     * @param endsOn 마감일
     * @param state 펀딩 상태
     * @return 펀딩 목록
     * @author HG
     */
    List<Funding> findByEndsOnAndState(LocalDate endsOn, FundingState state);

    /**
     * 특정 날짜에 마감되고 특정 상태인 펀딩들을 Cinema와 함께 조회합니다.
     * N+1 문제를 방지하기 위해 JOIN FETCH를 사용합니다.
     *
     * @param endsOn 마감일
     * @param state 펀딩 상태
     * @return 펀딩 목록 (Cinema 정보 포함)
     * @author HG
     */
    @Query("SELECT f FROM Funding f JOIN FETCH f.cinema WHERE f.endsOn = :endsOn AND f.state = :state")
    List<Funding> findByEndsOnAndStateWithCinema(@Param("endsOn") LocalDate endsOn, @Param("state") FundingState state);

    /**
     * 특정 날짜에 마감되고 특정 상태인 펀딩들을 Cinema와 Screen과 함께 조회합니다.
     * N+1 문제를 방지하기 위해 JOIN FETCH를 사용합니다.
     *
     * @param endsOn 마감일
     * @param state 펀딩 상태
     * @return 펀딩 목록 (Cinema, Screen 정보 포함)
     * @author HG
     */
    @Query("SELECT f FROM Funding f JOIN FETCH f.cinema JOIN FETCH f.screen WHERE f.endsOn = :endsOn AND f.state = :state")
    List<Funding> findByEndsOnAndStateWithCinemaAndScreen(@Param("endsOn") LocalDate endsOn, @Param("state") FundingState state);
}
