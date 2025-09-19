/**
 * 펀딩 목록 React Query 훅 (무한 스크롤)
 * 
 * 둘러보기 및 펀딩 목록 조회에 공용으로 사용되는 훅입니다.
 * useInfiniteQuery를 사용하여 무한 스크롤을 지원합니다.
 * 
 * queryKey: ['fundings', paramsWithoutPage]
 * 반환: { items: CardItem[]; fetchNextPage; hasNextPage; isFetchingNextPage; ... }
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import type { QueryParams } from '@/types/query';
import type { CardItem } from '@/types/cardItem';
import { mapFundingDtoToCardItem } from '@/mappers/cardItemMapper';

interface UseFundingsParams extends Omit<QueryParams, 'page'> {
  // page는 제외하고 나머지 QueryParams 사용
}

/**
 * 펀딩 목록 조회 훅 (무한 스크롤)
 * 
 * 다양한 필터와 정렬 옵션을 제공하는 펀딩 목록을 조회합니다.
 * 둘러보기, 카테고리별 펀딩 목록 등에서 공용으로 사용됩니다.
 * 
 * @param params - 쿼리 파라미터 (page 제외)
 * @returns 무한 스크롤 가능한 펀딩 목록과 페이징 핸들러
 */
export function useFundings(params: UseFundingsParams = {}) {
  // page를 제외한 파라미터만 queryKey에 포함
  const { size = 20, ...paramsWithoutPage } = params;

  return useInfiniteQuery({
    queryKey: ['fundings', paramsWithoutPage],
    queryFn: async ({ pageParam = 0 }) => {
      // TODO: 서비스 함수 연결
      // return await getFundings({ 
      //   ...params, 
      //   page: pageParam,
      //   size 
      // });
      throw new Error('Service not implemented yet');
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // TODO: API 응답 구조에 맞게 수정
      // const { number, totalPages } = lastPage.data.page;
      // return number + 1 < totalPages ? number + 1 : undefined;
      return undefined;
    },
    select: (data) => ({
      ...data,
      // TODO: API 응답 구조에 맞게 수정
      items: data.pages.flatMap(page => 
        // page.data.content.map(item =>
        //   mapFundingDtoToCardItem({ funding: item.funding, cinema: item.cinema })
        // )
        [] as CardItem[]
      ),
    }),
    staleTime: 60_000, // 1분
    gcTime: 300_000,   // 5분
    retry: 1,
  });
}

/*
사용 예시:

// 둘러보기 페이지에서
const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage,
  isLoading,
  error 
} = useFundings({
  type: 'funding',
  sortBy: 'popular',
  category: '영화',
  region: '서울시',
  size: 20
});

const items = data?.items || [];

// 무한 스크롤 트리거
const handleLoadMore = () => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
};

// 필터 변경
const handleFilterChange = (newFilters) => {
  // 새로운 필터로 params 업데이트
  // React Query가 자동으로 새로운 쿼리 실행
};
*/