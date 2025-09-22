import { buildUrl } from './client';
import type { SearchParams, ApiSearchResponse, ApiRecentlyViewedResponse } from '@/types/searchApi';
const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const searchItems = async (params: SearchParams = {}): Promise<ApiSearchResponse> => {
  try {
    // cursor 파라미터를 nextCursor로 변환
    const { cursor, ...otherParams } = params;
    const searchParams = cursor ? { ...otherParams, nextCursor: cursor } : otherParams;
    
    const url = buildUrl('search', searchParams);
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

    const result: ApiSearchResponse = await response.json();

    if (result.state === 'FAIL' || result.state === 'ERROR') {
      console.error('[Search API] 서버 에러:', result.message);
      throw new Error(`Server error: ${result.message} (code: ${result.code})`);
    }

    console.log('[Search API] 성공:', `${result.data?.content?.length || 0}개 항목 조회`);
    console.log('[Search API] 응답:', result);
    return result;
  } catch (error) {
    console.error('[Search API] 오류:', error);
    throw error;
  }
};

export const getRecentlyViewed = async (ids: string[], userId?: number): Promise<ApiRecentlyViewedResponse> => {
  try {
    const url = `${BaseUrl}funding/list?ids=${ids.join(',')}&userId=${userId}`;
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
    console.log('[Search API] 응답:', result.data);
    return result;
  } catch (error) {
    console.error('[Search API] 오류:', error);
    throw error;
  }
};
