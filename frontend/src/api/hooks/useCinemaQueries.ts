import { useQuery } from '@tanstack/react-query';
import { getCinemas, getCinemaDetail, getReservationTime } from '../cinema';
import { formatDateToISOString } from '../../mappers/dateMapper';

// React Query
// 특정 상영관 종류와 구로 극장 조회 (주요 사용 케이스)
export const useGetCinemas = (city: string, district: string, features: string[]) => {
  return useQuery({
    queryKey: ['cinemas', 'byFeatureAndDistrict', city, district, features],
    queryFn: () => getCinemas({ city, district, feature: features }),
    enabled: !!(district && features),
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
export const useGetReservationTime = (screenId: number, targetDate: Date) => {
  // Date 객체를 YYYY-MM-DD 문자열로 변환하여 queryKey에 사용
  const dateString = formatDateToISOString(targetDate);
  return useQuery({
    queryKey: ['screen', 'reservationTime', screenId, dateString],
    queryFn: () => getReservationTime(screenId, targetDate),
    enabled: !!screenId && screenId > 0 && !!targetDate, // screenId와 targetDate가 유효할 때만 실행
  });
};
