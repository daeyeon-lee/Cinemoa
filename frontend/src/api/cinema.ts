import { CinemaResponse, CinemaDetailResponse, ReservationTime, CinemaParams } from '@/types/cinema';
import { formatDateToISOString } from '@/mappers/dateMapper';
const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// 영화관 전체 목록 조회
export const getCinemas = async (params: CinemaParams = {}): Promise<CinemaResponse> => {
  try {
    // URL 파라미터 구성
    const searchParams = new URLSearchParams();

    if (params.city && params.city.trim()) {
      searchParams.set('city', params.city);
    }
    if (params.district && params.district.trim()) {
      searchParams.set('district', params.district);
    }
    if (params.feature && params.feature.length > 0) {
      params.feature.forEach((feature: string) => {
        searchParams.append('feature', feature);
      });
    }
    if (params.cinemald) {
      searchParams.set('cinemald', params.cinemald.toString());
    }
    const queryString = searchParams.toString();
    const url = `${BaseUrl}cinema${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 서버 응답 에러:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('전체 영화관 조회:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ API 오류:', error);
    throw error;
  }
};

// 영화관 상세 조회
export const getCinemaDetail = async (cinemaId: number, features?: string[]): Promise<CinemaDetailResponse> => {
  try {
    let url = `https://j13a110.p.ssafy.io:8443/api/cinema/${cinemaId}`;

    // feature 파라미터가 있으면 추가
    if (features && features.length > 0) {
      const featureParams = features.map((feature) => `feature=${feature}`).join('&');
      url += `?${featureParams}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    console.log('영화관 상세 조회:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ API 오류:', error);
    throw error;
  }
};

// 예약 가능시간 조회
export const getReservationTime = async (screenId: number, targetDate: Date): Promise<ReservationTime> => {
  try {
    // Date 객체를 YYYY-MM-DD 형식으로 변환
    const targetDateString = formatDateToISOString(targetDate);
    const url = `https://j13a110.p.ssafy.io:8443/api/screen/${screenId}/available-time?targetDate=${targetDateString}`;
    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 서버 응답 에러:', errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('예약 가능시간:', data.data);
    console.log('url:', url);

    return data.data;
  } catch (error) {
    console.error('❌ API 오류:', error);
    throw error;
  }
};
