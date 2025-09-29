import { useQuery } from '@tanstack/react-query';
import { getCinemas, getCinemaDetail, getReservationTime } from '../../api/cinema';
import { formatDateToISOString } from '../../mappers/dateMapper';

// React Query
// 특정 상영관 종류와 구로 극장 조회 (주요 사용 케이스)
export const useGetCinemas = (city: string, district: string, features: string[]) => {
  return useQuery({
    queryKey: ['cinemas', 'byFeatureAndDistrict', city, district, features],
    queryFn: () =>
      getCinemas({
        city,
        ...(district && { district }), // district가 있을 때만 포함
        feature: features,
      }),
    enabled: !!(features && features.length > 0), // features만 있으면 실행 (district는 선택사항)
  });
};

// 구로만 영화관 전체 조회 (투표용)
export const useGetCinemasByDistrict = (city: string, district: string) => {
  return useQuery({
    queryKey: ['cinemas', 'byDistrict', city, district],
    queryFn: () =>
      getCinemas({
        city,
        ...(district && district !== '전체' && { district }), // district가 '전체'가 아닐 때만 포함
      }),
    enabled: !!city, // city가 있으면 실행
  });
};

// 영화관 상세 조회
export const useGetCinemaDetail = (cinemaId: number, features?: string[]) => {
  return useQuery({
    queryKey: ['cinema', 'detail', cinemaId, features],
    queryFn: () => getCinemaDetail(cinemaId, features),
    enabled: !!cinemaId && cinemaId > 0, // cinemaId가 유효할 때만 실행
  });
};

// 영화관 대관 가능 시간 조회
export const useGetReservationTime = (screenId: number, selectedDate: string) => {
  // selectedDate가 있을 때만 Date 객체로 변환
  const targetDate = selectedDate ? new Date(selectedDate) : null;
  const dateString = selectedDate || '';

  return useQuery({
    queryKey: ['screen', 'reservationTime', screenId, dateString],
    queryFn: () => getReservationTime(screenId, targetDate!),
    enabled: !!screenId && screenId > 0 && !!selectedDate && !!targetDate, // 모든 조건이 만족될 때만 실행
  });
};
