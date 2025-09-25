/**
 * 통합 검색 React Query 훅
 *
 * @description 둘러보기/이거어때/검색 페이지에서 공용으로 사용
 * @features
 * - 응답 기반 동적 페이징: hasNext에 따라 서버/클라이언트 페이징 결정
 * - 서버 페이징: nextCursor 기반 무한스크롤
 * - 클라이언트 페이징: 전체 데이터를 16개씩 슬라이싱
 * - 자동 에러 처리 및 재시도
 */

import { useInfiniteQuery, type InfiniteData } from '@tanstack/react-query';
import type { SearchParams, ApiSearchResponse } from '@/types/searchApi';
import { searchItems } from '@/api/search';

interface UseSearchParams extends Omit<SearchParams, 'cursor'> {}

const PAGE_SIZE = 16;

/**
 * 서버 응답이 유효한지 확인
 */
const isValidResponse = (page: any): page is ApiSearchResponse => {
  return page && 'data' in page && page.data;
};

/**
 * 다음 페이지 파라미터 계산
 */
const getNextPageParam = (lastPage: ApiSearchResponse, _: ApiSearchResponse[], lastPageParam: string | number) => {
  if (!isValidResponse(lastPage)) return undefined;

  const { hasNextPage, nextCursor, content } = lastPage.data;

  if (hasNextPage && nextCursor) {
    // 서버 페이지네이션: nextCursor 사용
    // console.log('[useSearch] 다음 서버 페이지:', nextCursor);
    return nextCursor;
  }

  if (!hasNextPage && content) {
    // 클라이언트 페이지네이션: 16개씩 슬라이싱 계산
    const currentPage = typeof lastPageParam === 'number' ? lastPageParam : 0;
    const nextStartIndex = (currentPage + 1) * PAGE_SIZE;
    const hasMoreItems = nextStartIndex < content.length;

    if (hasMoreItems) {
      // console.log('[useSearch] 다음 클라이언트 페이지:', currentPage + 1);
      return currentPage + 1;
    }
  }

  // console.log('[useSearch] 더 이상 페이지 없음');
  return undefined;
};

/**
 * 응답 데이터 변환
 */
const selectData = (data: InfiniteData<ApiSearchResponse, string | number>) => {
  const firstPage = data.pages[0];
  if (!isValidResponse(firstPage)) {
    return { ...data, content: [] };
  }

  const { hasNextPage, content: allItems } = firstPage.data;

  if (hasNextPage) {
    // 서버 페이지네이션: 모든 페이지 평탄화
    const content = data.pages.filter(isValidResponse).flatMap((page) => page.data?.content || []);

    // console.log(`[useSearch] 서버 페이징 - 총 ${content.length}개 아이템`);
    return { ...data, content };
  }

  // 클라이언트 페이지네이션: 페이지 수만큼 슬라이싱
  const visiblePageCount = data.pages.length;
  const visibleItems = allItems.slice(0, visiblePageCount * PAGE_SIZE);

  // console.log(`[useSearch] 클라이언트 페이징 - ${visibleItems.length}/${allItems.length}개 표시`);
  return { ...data, content: visibleItems };
};

/**
 * 통합 검색 훅
 */
export function useSearch(params: UseSearchParams = {}) {
  const { ...queryParams } = params;

  // console.log('[useSearch] 호출:', { params: queryParams });

  return useInfiniteQuery({
    queryKey: ['search', queryParams],

    queryFn: async ({ pageParam = 0 }) => {
      const requestParams = {
        ...params,
        ...(pageParam !== 0 ? { cursor: pageParam } : {}),
      };

      // console.log('[useSearch] API 요청:', requestParams);

      const response = await searchItems(requestParams);

      // console.log('[useSearch] 응답:', {
      //   itemCount: response.data?.content?.length || 0,
      //   hasNextPage: response.data?.hasNextPage,
      //   nextCursor: response.data?.nextCursor,
      // });

      return response;
    },

    initialPageParam: 0,
    getNextPageParam,
    select: selectData,

    staleTime: 60_000,
    gcTime: 300_000,
    retry: (failureCount, error) => {
      // 500 에러는 3번 재시도
      if (error instanceof Error && error.message.includes('500')) {
        return failureCount < 3;
      }
      // 네트워크 에러는 2번 재시도
      if (error instanceof Error && error.message.includes('Failed to fetch')) {
        return failureCount < 2;
      }
      // 기타 에러는 1번만 재시도
      return failureCount < 1;
    },
  });
}
