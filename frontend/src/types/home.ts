/**
 * 홈페이지 API 요청/응답 타입 정의
 * 
 * @description 홈페이지에서 사용하는 API의 요청 파라미터와 응답 데이터 형식
 */

import type { ApiSearchItem } from './searchApi';

// ========================================
// 인기 상영회 API
// ========================================

/**
 * 인기 상영회 조회 요청 파라미터
 */
export interface GetPopularFundingParams {
  userId?: number;
}

/**
 * 인기 상영회 조회 응답
 */
export interface GetPopularFundingResponse {
  data: {
    content: ApiSearchItem[];
  };
  code: number;
  message: string;
  state: 'SUCCESS' | 'FAIL' | 'ERROR';
}

// ========================================
// 추천 상영회 API
// ========================================

/**
 * 추천 상영회 조회 요청 파라미터
 */
export interface GetRecommendedFundingParams {
  userId?: number;
}

/**
 * 추천 상영회 조회 응답
 */
export interface GetRecommendedFundingResponse {
  data: {
    content: ApiSearchItem[];
    nextCursor: string | null;
    hasNext: boolean;
  };
  code: number;
  message: string;
  state: 'SUCCESS' | 'FAIL' | 'ERROR';
}

// ========================================
// 종료 임박 상영회 API
// ========================================

/**
 * 종료 임박 상영회 조회 요청 파라미터
 */
export interface GetClosingSoonFundingParams {
  userId?: number;
}

/**
 * 종료 임박 상영회 조회 응답
 */
export interface GetClosingSoonFundingResponse {
  data: {
    content: ApiSearchItem[];
    nextCursor: string | null;
    hasNext: boolean;
  };
  code: number;
  message: string;
  state: 'SUCCESS' | 'FAIL' | 'ERROR';
}

// ========================================
// 최근 본 상영회 API
// ========================================

/**
 * 최근 본 상영회 조회 요청 파라미터
 */
export interface GetRecentlyViewedFundingParams {
  userId: number;
}

/**
 * 최근 본 상영회 조회 응답
 */
export interface GetRecentlyViewedFundingResponse {
  data: {
    content: ApiSearchItem[];
    nextCursor: string | null;
    hasNext: boolean;
  };
  code: number;
  message: string;
  state: 'SUCCESS' | 'FAIL' | 'ERROR';
}