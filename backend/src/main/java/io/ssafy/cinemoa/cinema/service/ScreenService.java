package io.ssafy.cinemoa.cinema.service;

import io.ssafy.cinemoa.cinema.dto.ScreenInfoDto;            // 화면(상영관) 정보를 담아 되돌려줄 DTO(데이터 묶음)
import io.ssafy.cinemoa.cinema.repository.ScreenRepository;   // 화면(상영관) DB 테이블을 읽고 쓰는 도우미(리포지토리)
import io.ssafy.cinemoa.cinema.repository.ScreenUnavailableTimeRepository; // 상영 불가 시간표 DB 리포지토리
import io.ssafy.cinemoa.cinema.repository.entity.Screen;      // 화면(상영관) 엔티티(DB 한 행을 자바 객체로 표현)
import io.ssafy.cinemoa.global.exception.ResourceNotFoundException; // 데이터를 못 찾았을 때 던지는 예외
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;                         // final 필드로 생성자를 자동 생성해주는 롬복 어노테이션
import org.springframework.stereotype.Service;                // "이 클래스는 비즈니스 로직을 담당해!" 라는 표시

@Service                                                     // 스프링이 이 클래스를 서비스 빈으로 등록함
@RequiredArgsConstructor                                     // 아래 final 필드들을 받는 생성자를 자동으로 만들어 줌
public class ScreenService {

    // 생성자 주입 대상(스프링이 알아서 넣어줌). DB 접근 도우미(리포지토리)들
    private final ScreenRepository screenRepository;
    private final ScreenUnavailableTimeRepository timeRepository;

    /**
     * 특정 상영관(screenId)의 targetDate 날짜에 '예약 가능한 시간들'을 구해서 돌려주는 메서드
     * @param screenId   상영관 ID (예: 3번관)
     * @param targetDate 어떤 날짜인지 (예: 2025-09-10)
     * @return ScreenInfoDto (상영관 기본 정보 + 가능한 시간 목록)
     */
    public ScreenInfoDto getAvailableTimesOfScreen(Long screenId, LocalDate targetDate) {
        // 1) 상영관 존재 여부 확인 (없으면 예외 던져서 바로 끝냄)
        //    findById(...)는 Optional을 주고, orElseThrow(...)로 "없을 때 예외"를 지정함
        Screen screen = screenRepository.findById(screenId)
                .orElseThrow(ResourceNotFoundException::ofScreen); // 메서드 참조 문법(없을 때 예외 생성)

        // 2) 그 날짜에 "이미 막혀있는 시간대(한 시간 단위 블럭)" 목록을 DB에서 가져옴
        //    메서드 이름이 길어 보이지만, "화면ID와 날짜로 hourBlock을 올림차순으로" 라는 의미를 그대로 이름에 씀
        //    Set<Byte> : 중복 없이 시간 숫자(0~23)를 담는 집합
        Set<Byte> unavailableTimes =
                timeRepository.findHourBlocksByScreen_ScreenIdAndTargetDateOrderByHourBlockAsc(
                        screenId, targetDate);

        // 3) 0~23시 중에서 가능한 시간대를 모아 List로 만듦
        //    정책: 새벽 4~6시는 아예 건너뜀(유지보수/점검 시간 같은 내부 규칙이라고 이해하면 됨)
        List<Byte> timeblocks = new ArrayList<>();
        for (byte i = 0; i <= 23; ++i) {
            // 새벽 4,5,6시는 제외
            if (i >= 4 && i < 7) {
                continue;
            }
            // 이미 막혀 있지 않다면(= 예약 가능하다면) 결과 목록에 추가
            if (!unavailableTimes.contains(i)) {
                timeblocks.add(i);
            }
        }

        // 4) DTO로 예쁘게 싸서 돌려줌 (화면 기본 정보 + 가능한 시간 리스트)
        return ScreenInfoDto.of(screen, timeblocks);
    }
}




//package io.ssafy.cinemoa.cinema.service;
//
//import io.ssafy.cinemoa.cinema.dto.ScreenInfoDto;
//import io.ssafy.cinemoa.cinema.repository.ScreenRepository;
//import io.ssafy.cinemoa.cinema.repository.ScreenUnavailableTimeRepository;
//import io.ssafy.cinemoa.cinema.repository.entity.Screen;
//import io.ssafy.cinemoa.global.exception.ResourceNotFoundException;
//import java.time.LocalDate;
//import java.util.ArrayList;
//import java.util.List;
//import java.util.Set;
//import lombok.RequiredArgsConstructor;
//import org.springframework.stereotype.Service;
//
//@Service
//@RequiredArgsConstructor
//public class ScreenService {
//
//    private final ScreenRepository screenRepository;
//    private final ScreenUnavailableTimeRepository timeRepository;
//
//    public ScreenInfoDto getAvailableTimesOfScreen(Long screenId, LocalDate targetDate) {
//        Screen screen = screenRepository.findById(screenId)
//                .orElseThrow(ResourceNotFoundException::ofScreen);
//
//        Set<Byte> unavailableTimes = timeRepository.findHourBlocksByScreen_ScreenIdAndTargetDateOrderByHourBlockAsc(
//                screenId, targetDate);
//
//        List<Byte> timeblocks = new ArrayList<>();
//        for (byte i = 0; i <= 23; ++i) {
//            if (i >= 4 && i < 7) {
//                continue;
//            }
//            if (!unavailableTimes.contains(i)) {
//                timeblocks.add(i);
//            }
//        }
//
//        return ScreenInfoDto.of(screen, timeblocks);
//    }
//}
