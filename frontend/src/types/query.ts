/**
 * Query Types
 *
 * API 요청에 사용되는 공통 쿼리 파라미터 타입 정의
 * 둘러보기, 이거어때, 검색 등 모든 리스트 조회 API에서 공용으로 사용
 *
 * UI는 서비스 시그니처만 사용하는 원칙에 따라,
 * 컴포넌트는 이 QueryParams를 직접 구성하여 서비스 함수에 전달
 */

export type SortBy = 'popular' | 'deadline' | 'latest' | 'favorite';

export type FundingType = 'funding' | 'vote' | 'all';

export interface QueryParams {
  /** 검색 키워드 */
  q?: string;

  /** 사용자 ID (개인화/추천 등에 사용) */
  userId?: number;

  /** 펀딩 타입 필터 */
  type?: FundingType;

  /** 정렬 기준 */
  sortBy?: SortBy;

  /** 카테고리 필터 (예: "영화", "뮤지컬", "공연" 등) */
  category?: string;

  /** 지역 필터 (예: "강남구", "중구", "종로구" 등) */
  region?: string;

  /** 극장 타입 필터 (예: "IMAX", "FDX", "NORMAL" 등) */
  theaterType?: string;

  /** 종료된 펀딩 포함 여부 */
  isClosed?: boolean;

  /** 페이지 번호 (0부터 시작) */
  page?: number;

  /** 페이지 크기 */
  size?: number;
}

/*
사용 예시:

// 홈 - 추천 상영회
const homeRecommendedParams: QueryParams = {
  userId: 123,
  type: 'all',
  sortBy: 'popular',
  size: 8
};

// 둘러보기 - 펀딩만
const browseFundingParams: QueryParams = {
  type: 'funding',
  sortBy: 'deadline',
  category: '영화',
  region: '서울시',
  page: 0,
  size: 20
};

// 검색
const searchParams: QueryParams = {
  q: '스파이더맨',
  type: 'all',
  sortBy: 'latest',
  page: 0,
  size: 10
};
*/
