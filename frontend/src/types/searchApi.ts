/**
 * Search API 타입 정의
 *
 * @description 백엔드 /search API의 실제 응답 구조를 기준으로 한 타입 정의
 * 모든 검색 관련 API 타입의 단일 소스 오브 트루스(Single Source of Truth)
 */

// ========================================
// 쿼리 파라미터 타입
// ========================================

export type SortBy = 'RECOMMENDED' | 'POPULAR' | 'LATEST';
export type FundingType = 'FUNDING' | 'VOTE';
export type FundingState = 'SUCCESS' | 'EVALUATING' | 'REJECTED' | 'WAITING' | 'ON_PROGRESS' | 'FAILED' | 'VOTING';
export type ApiState = 'SUCCESS' | 'FAIL' | 'ERROR';

/**
 * /search API 쿼리 파라미터
 */
export interface SearchParams {
  /** 검색 키워드 */
  q?: string;
  /** 사용자 ID */
  userId?: number;
  /** 펀딩 타입 */
  fundingType?: FundingType;
  /** 정렬 기준 */
  sortBy?: SortBy;
  /** 카테고리 ID (단일 값) */
  category?: number;
  /** 지역 */
  region?: string;
  /** 상영관 타입 배열 */
  theaterType?: string[];
  /** 종료된 펀딩 포함 여부 */
  isClosed?: boolean;
  /** 커서 (페이지네이션) */
  cursor?: string | number;
}

// ========================================
// API 응답 타입 (서버 구조 그대로)
// ========================================

/**
 * 펀딩 정보
 */
export interface ApiFunding {
  fundingId: number;
  title: string;
  videoName: string;
  bannerUrl: string;
  state: FundingState;
  progressRate: number;
  fundingEndsOn: string;
  screenDate: string;
  price: number;
  maxPeople: number;
  participantCount: number;
  favoriteCount: number;
  isLiked: boolean;
  fundingType: FundingType;
}

/**
 * 상영관 정보
 */
export interface ApiCinema {
  cinemaId: number;
  cinemaName: string;
  city: string;
  district: string;
}

/**
 * 검색 결과 아이템
 */
export interface ApiSearchItem {
  funding: ApiFunding;
  cinema: ApiCinema;
}

/**
 * /search API 응답
 */
export interface ApiSearchResponse {
  data: {
    content: ApiSearchItem[];
    nextCursor: string | null;
    hasNext: boolean;
  };
  code: number;
  message: string;
  state: ApiState;
}

/**
 * /funding/recommendation API 응답
 * ApiSearchResponse와 동일한 구조
 */
export type ApiRecommendationResponse = ApiSearchResponse;

// ========================================
// UI 변환 타입 (필요한 경우)
// ========================================

/**
 * UI용 카드 아이템 (API 응답을 UI에 맞게 변환)
 */
export interface UiCardItem {
  id: number; // fundingId
  title: string;
  bannerUrl: string;
  state: FundingState;
  fundingType: FundingType;
  favoriteCount: number;
  isLiked: boolean;
  fundingEndsOn: string;
  screenDate: string;

  // 펀딩 전용 필드
  price?: number;
  progressRate?: number;
  maxPeople?: number;
  participantCount?: number;

  // 상영관 정보
  cinema: {
    id: number;
    name: string;
    city: string;
    district: string;
  };
}

// ========================================
// 타입 가드 및 유틸리티
// ========================================

export const isFundingType = (item: UiCardItem): boolean => item.fundingType === 'FUNDING';
export const isVoteType = (item: UiCardItem): boolean => item.fundingType === 'VOTE';

/**
 * API 응답을 UI 카드 아이템으로 변환
 */
export const mapApiItemToUiCard = (item: ApiSearchItem): UiCardItem => ({
  id: item.funding.fundingId,
  title: item.funding.title,
  bannerUrl: item.funding.bannerUrl,
  state: item.funding.state,
  fundingType: item.funding.fundingType,
  favoriteCount: item.funding.favoriteCount,
  isLiked: item.funding.isLiked,
  fundingEndsOn: item.funding.fundingEndsOn,
  screenDate: item.funding.screenDate,
  price: item.funding.price,
  progressRate: item.funding.progressRate,
  maxPeople: item.funding.maxPeople,
  participantCount: item.funding.participantCount,
  cinema: {
    id: item.cinema.cinemaId,
    name: item.cinema.cinemaName,
    city: item.cinema.city,
    district: item.cinema.district,
  },
});
