import { UpdateUserInfoRequest, UpdateUserInfoResponse, UpdateRefundAccountRequest, UpdateRefundAccountResponse } from '@/types/user';
import { buildUrl } from './client';
import type { ApiSearchResponse, ApiRecentlyViewedResponse } from '@/types/searchApi';
import type { GetPopularFundingResponse, GetClosingSoonFundingResponse } from '@/types/home';

// 사용자 추가 정보 입력 API
export const updateUserAdditionalInfo = async (userId: number, data: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> => {
  try {
    console.log('=== 사용자 추가 정보 입력 시작 ===');
    // console.log('사용자 ID:', userId);
    // console.log('요청 데이터:', data);

    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}user/${userId}`, {
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

// 환불계좌 변경 API
export const updateRefundAccount = async (userId: number, data: UpdateRefundAccountRequest): Promise<UpdateRefundAccountResponse> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}user/${userId}/refund-account`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 세션 기반 인증을 위해 쿠키 포함
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('환불계좌 변경 API 에러:', response.status, errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: UpdateRefundAccountResponse = await response.json();
    return result;
  } catch (error) {
    console.error('환불계좌 변경 실패:', error);
    throw error;
  }
};

// 추천 상영회 조회 API
export const getRecommendedFunding = async (userId?: number): Promise<ApiSearchResponse> => {
  try {
    // 새로운 API 경로 사용 - userId는 쿼리 파라미터로 전달
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}funding/recommendation`;
    console.log('userId:', userId);
    const url = userId ? `${baseUrl}?userId=${userId}` : baseUrl;

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
      // 데이터가 없으면 search로 8개 조회 (최신순)
      return await getSearchFunding({ sortBy: 'POPULAR', size: 8 });
    }

    const rawResult = await response.json();

    // 데이터가 비어있으면 fallback (변환 전에 미리 체크)
    if (!rawResult.data || rawResult.data.length === 0) {
      console.warn('[추천api] 빈 데이터, search fallback 사용');
      return await getSearchFunding({ sortBy: 'POPULAR', size: 8 });
    }

    console.log('[추천api] 성공:', rawResult);

    // rawResult를 ApiSearchResponse 구조로 변환하여 반환
    return {
      data: {
        content: rawResult.data,
        nextCursor: null,
        hasNextPage: false,
      },
      code: rawResult.code,
      message: rawResult.message,
      state: rawResult.state,
    };
  } catch (error) {
    console.error('[추천api] 오류, search fallback 사용:', error);
    return await getSearchFunding({ sortBy: 'POPULAR', size: 8 });
  }
};

// 인기 상영회 조회 API
export const getPopularFunding = async (userId?: number): Promise<GetPopularFundingResponse> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}funding/popular`;

    console.log('[인기api] 요청 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 쿠키 포함
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[인기api] 응답 오류:', response.status, errorData);

      // 404 에러 처리 (존재하지 않는 사용자)
      if (response.status === 404) {
        throw new Error(`존재하지 않는 사용자입니다. (code: ${errorData.code || 40401})`);
      }

      throw new Error(`인기 상영회 조회 실패: ${response.status}`);
    }

    const data: GetPopularFundingResponse = await response.json();
    console.log('[인기api] 응답 성공:', data);

    return data;
  } catch (error) {
    console.error('[인기api] 오류:', error);

    // 에러 발생 시 빈 응답 반환
    return {
      data: [],
      code: 500,
      message: '인기 상영회 조회 중 오류가 발생했습니다.',
      state: 'FAIL',
    };
  }
};

// 종료 임박 상영회 조회 API
export const getExpiringSoonFunding = async (userId?: number): Promise<GetClosingSoonFundingResponse> => {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}funding/expiring${userId ? `?userId=${userId}` : ''}`;

    console.log('[종료임박api] 요청 URL:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: GetClosingSoonFundingResponse = await response.json();
    console.log('[종료임박api] 응답 데이터:', data);

    return data;
  } catch (error) {
    console.error('[종료임박api] 오류:', error);
    throw error;
  }
};

// Search API fallback 함수
const getSearchFunding = async (params: { sortBy: 'RECOMMENDED' | 'POPULAR'; size: number }): Promise<ApiSearchResponse> => {
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

export const getRecentlyViewed = async (ids: string[], userId?: number): Promise<ApiRecentlyViewedResponse> => {
  try {
    const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}funding/list?ids=${ids.join(',')}`;
    const url = userId ? `${baseUrl}&userId=${userId}` : baseUrl;
    console.log('[Search API] 요청:', url);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Search API] HTTP 에러:', response.status, errorData);
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    const result: ApiRecentlyViewedResponse = await response.json();
    console.log('[최신api] 응답 성공:', result.data);
    return result;
  } catch (error) {
    console.error('[Search API] 오류:', error);
    throw error;
  }
};
