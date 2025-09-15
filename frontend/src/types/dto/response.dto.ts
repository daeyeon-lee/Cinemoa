/**
 * API Response DTOs
 * 
 * 공통 API 응답 구조와 페이지네이션 타입 정의
 */

export interface PageDto {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

export interface ListResponseDto<T> {
  content: T[];
  page: PageDto;
}

export interface ApiResponseDto<T> {
  data: T;
  code: number;
  message: string;
  state: string;
}

// 카드 리스트 응답 유틸 타입
export type PaginatedCardsResponseDto = ApiResponseDto<ListResponseDto<{
  funding: import('./funding.dto').FundingDto;
  cinema: import('./cinema.dto').CinemaDto;
}>>;