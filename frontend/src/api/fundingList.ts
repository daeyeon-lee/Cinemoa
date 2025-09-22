/**
 * 펀딩 목록 조회 전용 API
 * 
 * 검색 API를 활용한 목록 조회만 담당합니다.
 * 
 * 🚧 임시 주석 처리: 리스트 조회는 다른 팀원이 작업 중입니다.
 *    Detail 기능 완료 후 연동 예정입니다.
 */

/*
import { buildUrl } from './client';
import type { SearchParams, ApiSearchResponse } from '@/types/searchApi';

// 펀딩 목록 조회 (검색 API 활용)
export const getFundingList = async (params: SearchParams = {}): Promise<ApiSearchResponse> => {
  try {
    const url = buildUrl('search', params);
    console.log('[펀딩 목록 조회]:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`목록 조회 실패: ${response.status}`);
    }

    const result: ApiSearchResponse = await response.json();
    console.log('[펀딩 목록 조회 성공]:', `${result.data?.content?.length || 0}개 항목`);
    
    return result;
  } catch (error) {
    console.error('[펀딩 목록 조회 에러]:', error);
    throw error;
  }
};
*/
