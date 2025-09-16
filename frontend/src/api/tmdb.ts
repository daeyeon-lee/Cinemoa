import { TMDBMultiResponse, MultiSearchResponse, TMDBMultiItem, TMDBMovie, TMDBTV, TMDBPerson } from '@/types/tmdb';

// TMDB API 클라이언트
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

// TMDB API 호출 함수
export const tmdbClient = {
  async get(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set('api_key', TMDB_API_KEY || '');

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`TMDB API 요청 실패: ${response.status}`);
    }

    return response.json();
  },
};

// 미디어 타입별 제목 추출 함수
export const getMediaTitle = (item: TMDBMultiItem): string => {
  switch (item.media_type) {
    case 'movie':
      return (item as TMDBMovie).title || '';
    case 'tv':
      return (item as TMDBTV).name || '';
    case 'person':
      return (item as TMDBPerson).name || '';
    default:
      return '';
  }
};

// 미디어 타입별 날짜 추출 함수
export const getMediaDate = (item: TMDBMultiItem): string => {
  switch (item.media_type) {
    case 'movie':
      return (item as TMDBMovie).release_date || '';
    case 'tv':
      return (item as TMDBTV).first_air_date || '';
    case 'person':
      return '';
    default:
      return '';
  }
};

// 미디어 타입별 한국어 이름 함수
export const getMediaTypeKorean = (mediaType: string): string => {
  switch (mediaType) {
    case 'movie':
      return '영화';
    case 'tv':
      return 'TV 시리즈';
    case 'person':
      return '인물';
    default:
      return '알 수 없음';
  }
};

// Multi 검색 (영화, TV, 인물 등)
export const searchMulti = async (
  query: string,
  page: number = 1,
  language: string = 'ko-KR',
): Promise<MultiSearchResponse> => {
  if (!query.trim()) {
    return {
      success: false,
      error: '검색어가 필요합니다.',
    };
  }

  if (!TMDB_API_KEY) {
    return {
      success: false,
      error: 'TMDB API 키가 설정되지 않았습니다.',
    };
  }

  try {
    const data: TMDBMultiResponse = await tmdbClient.get('/search/multi', {
      query: query,
      language,
      page: page.toString(),
    });

    return {
      success: true,
      data: {
        results: data.results,
        total_results: data.total_results,
        page: data.page,
        total_pages: data.total_pages,
      },
    };
  } catch (error) {
    console.error('TMDB Multi 검색 오류:', error);
    return {
      success: false,
      error: '검색 중 오류가 발생했습니다.',
      details: error instanceof Error ? error.message : '알 수 없는 오류',
    };
  }
};
