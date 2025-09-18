// 공통 API 응답 타입
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

// TMDB Multi Search API 기본 타입
export interface TMDBMultiResult {
  adult: boolean;
  backdrop_path: string | null;
  id: number;
  original_language: string;
  overview: string;
  poster_path: string | null;
  media_type: 'movie' | 'tv' | 'person';
  genre_ids: number[];
  popularity: number;
  vote_average: number;
  vote_count: number;
}

// 영화 타입
export interface TMDBMovie extends TMDBMultiResult {
  media_type: 'movie';
  title: string;
  original_title: string;
  release_date: string;
  video: boolean;
}

// TV 시리즈 타입
export interface TMDBTV extends TMDBMultiResult {
  media_type: 'tv';
  name: string;
  original_name: string;
  first_air_date: string;
  origin_country: string[];
}

// 인물 타입
export interface TMDBPerson extends TMDBMultiResult {
  media_type: 'person';
  name: string;
  known_for_department: string;
  profile_path: string | null;
  known_for: Array<TMDBMovie | TMDBTV>;
}

// 통합 타입
export type TMDBMultiItem = TMDBMovie | TMDBTV | TMDBPerson;

export interface TMDBMultiResponse {
  page: number;
  results: TMDBMultiItem[];
  total_pages: number;
  total_results: number;
}

export interface MultiSearchResponse
  extends APIResponse<{
    results: TMDBMultiItem[];
    total_results: number;
    page: number;
    total_pages: number;
  }> {}
