import { UpdateUserInfoRequest, UpdateUserInfoResponse } from '@/types/user';
import { buildUrl } from './client';
import type { ApiSearchResponse } from '@/types/searchApi';

// 사용자 추가 정보 입력 API
export const updateUserAdditionalInfo = async (userId: number, data: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> => {
  try {
    console.log('=== 사용자 추가 정보 입력 시작 ===');
    // console.log('사용자 ID:', userId);
    // console.log('요청 데이터:', data);

    const response = await fetch(`https://j13a110.p.ssafy.io:8443/api/user/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 세션 기반 인증을 위해 쿠키 포함
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('=== API 응답 에러 ===');
      console.error('Status:', response.status);
      console.error('Error Data:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: UpdateUserInfoResponse = await response.json();
    console.log('=== 사용자 추가 정보 입력 성공 ===');
    // console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 사용자 추가 정보 입력 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};

// 추천 상영회 조회 API
export const getRecommendedFunding = async (userId?: number): Promise<ApiSearchResponse> => {
  try {
    // 로그인 상태에 따라 API 경로 분기
    const url = userId
      ? `${process.env.NEXT_PUBLIC_BASE_URL}user/${userId}/recommended-funding`
      : `${process.env.NEXT_PUBLIC_BASE_URL}user/recommended-funding`;

    console.log('[추천api] 요청:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.warn('[추천api] 실패, search fallback 사용');
      // 데이터가 없으면 search로 8개 조회
      return await getSearchFunding({ sortBy: 'RECOMMENDED', size: 8 });
    }

    const result: ApiSearchResponse = await response.json();

    // 데이터가 비어있으면 fallback
    if (!result.data?.content || result.data.content.length === 0) {
      console.warn('[추천api] 빈 데이터, search fallback 사용');
      return await getSearchFunding({ sortBy: 'RECOMMENDED', size: 8 });
    }

    console.log('[추천api] 성공:', `${result.data.content.length}개 조회`);
    return result;
  } catch (error) {
    console.error('[추천api] 오류, search fallback 사용:', error);
    return await getSearchFunding({ sortBy: 'RECOMMENDED', size: 8 });
  }
};

// 인기 상영회 조회 API (임시: search로 대체)
export const getPopularFunding = async (userId?: number): Promise<ApiSearchResponse> => {
  try {
    // TODO: 백엔드 개발 완료 후 실제 API 사용
    // const url = `${process.env.NEXT_PUBLIC_BASE_URL}funding/popular${userId ? `?userId=${userId}` : ''}`;

    console.log('[인기api] 개발 중, search로 대체');
    return await getSearchFunding({ sortBy: 'POPULAR', size: 8 });
  } catch (error) {
    console.error('[인기api] 오류:', error);
    return await getSearchFunding({ sortBy: 'POPULAR', size: 8 });
  }
};

// 종료 임박 상영회 조회 API (임시: search로 대체)
export const getExpiringSoonFunding = async (userId?: number): Promise<ApiSearchResponse> => {
  try {
    // TODO: 백엔드 개발 완료 후 실제 API 사용
    // const url = `${process.env.NEXT_PUBLIC_BASE_URL}funding/expiring${userId ? `?userId=${userId}` : ''}`;

    console.log('[종료임박api] 개발 중, search로 대체');
    return await getSearchFunding({ sortBy: 'RECOMMENDED', size: 5 });
  } catch (error) {
    console.error('[종료임박api] 오류:', error);
    return await getSearchFunding({ sortBy: 'RECOMMENDED', size: 5 });
  }
};

// Search API fallback 함수
const getSearchFunding = async (params: {
  sortBy: 'RECOMMENDED' | 'POPULAR';
  size: number;
}): Promise<ApiSearchResponse> => {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}search?sortBy=${params.sortBy}&size=${params.size}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Search fallback failed: ${response.status}`);
  }

  return await response.json();
};
