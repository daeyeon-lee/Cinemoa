import { CategoryValue } from '@/constants/categories';

export interface CategoryNavigationParams {
  category?: CategoryValue;
  // 추가로 전달할 수 있는 다른 필터 파라미터들
  region?: string[];
  theaterType?: string;
  sort?: string;
}

/**
 * 카테고리 페이지로 네비게이션
 */
export const navigateToCategory = (params: CategoryNavigationParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }

  if (params.region && params.region.length > 0) {
    searchParams.set('region', params.region.join(','));
  }

  if (params.theaterType) {
    searchParams.set('theaterType', params.theaterType);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/category?${queryString}` : '/category';

  window.location.href = url;
};

/**
 * 투표 페이지로 네비게이션
 */
export const navigateToVote = (params: CategoryNavigationParams = {}) => {
  const searchParams = new URLSearchParams();

  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }

  if (params.region && params.region.length > 0) {
    searchParams.set('region', params.region.join(','));
  }

  if (params.theaterType) {
    searchParams.set('theaterType', params.theaterType);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/vote?${queryString}` : '/vote';

  window.location.href = url;
};

/**
 * 검색 페이지로 네비게이션
 */
export const navigateToSearch = (params: CategoryNavigationParams & { query?: string } = {}) => {
  const searchParams = new URLSearchParams();

  if (params.query) {
    searchParams.set('q', params.query);
  }

  if (params.category && params.category !== 'all') {
    searchParams.set('category', params.category);
  }

  if (params.region && params.region.length > 0) {
    searchParams.set('region', params.region.join(','));
  }

  if (params.theaterType) {
    searchParams.set('theaterType', params.theaterType);
  }

  if (params.sort) {
    searchParams.set('sort', params.sort);
  }

  const queryString = searchParams.toString();
  const url = queryString ? `/search?${queryString}` : '/search';

  window.location.href = url;
};

/**
 * URL 파라미터에서 카테고리 정보 파싱
 */
export const parseCategoryFromURL = (): CategoryNavigationParams => {
  if (typeof window === 'undefined') return {};

  const searchParams = new URLSearchParams(window.location.search);

  return {
    category: (searchParams.get('category') as CategoryValue) || 'all',
    region: searchParams.get('region')?.split(',') || [],
    theaterType: searchParams.get('theaterType') || undefined,
    sort: searchParams.get('sort') || 'latest',
  };
};