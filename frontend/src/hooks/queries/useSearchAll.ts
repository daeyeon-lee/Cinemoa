/**
 * 통합 검색 React Query 훅 (무한 스크롤)
 * 
 * 키워드를 기반으로 펀딩과 투표를 통합 검색합니다.
 * useInfiniteQuery를 사용하여 무한 스크롤을 지원합니다.
 * 
 * queryKey: ['search', paramsWithoutPage]
 * 반환: { items: CardItem[]; fetchNextPage; hasNextPage; isFetchingNextPage; ... }
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import type { QueryParams } from '@/types/query';
import type { CardItem } from '@/types/cardItem';
import { mapFundingDtoToCardItem } from '@/mappers/cardItemMapper';

interface UseSearchAllParams extends Omit<QueryParams, 'page'> {
  /** 검색 키워드 (필수) */
  q: string;
}

/**
 * 통합 검색 조회 훅 (무한 스크롤)
 * 
 * 전문 검색 엔진을 활용하여 제목, 설명, 태그 등을 검색합니다.
 * 펀딩과 투표를 통합하여 검색하며, 연관 검색어 제안과 트렌딩 키워드를 반영합니다.
 * 
 * @param params - 검색 키워드를 포함한 쿼리 파라미터 (page 제외)
 * @returns 무한 스크롤 가능한 검색 결과와 페이징 핸들러
 */
export function useSearchAll(params: UseSearchAllParams) {
  // page를 제외한 파라미터만 queryKey에 포함
  const { size = 10, type = 'all', sortBy = 'latest', ...paramsWithoutPage } = params;

  return useInfiniteQuery({
    queryKey: ['search', paramsWithoutPage],
    queryFn: async ({ pageParam = 0 }) => {
      // TODO: 서비스 함수 연결
      // return await searchAll({ 
      //   ...params,
      //   type,
      //   sortBy,
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
    enabled: !!params.q?.trim(), // 검색어가 있을 때만 실행
    staleTime: 30_000, // 30초 (검색 결과는 빨리 변경될 수 있음)
    gcTime: 300_000,   // 5분
    retry: 1,
  });
}

/*
사용 예시:

// 검색 페이지에서
const [searchQuery, setSearchQuery] = useState('');
const [filters, setFilters] = useState({});

const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage,
  isLoading,
  error 
} = useSearchAll({
  q: searchQuery,
  type: 'all',
  sortBy: 'latest',
  category: filters.category,
  region: filters.region,
  size: 10
});

const items = data?.items || [];

// 검색어 변경
const handleSearch = (query: string) => {
  setSearchQuery(query);
  // React Query가 자동으로 새로운 검색 실행
};

// 필터 변경
const handleFilterChange = (newFilters) => {
  setFilters(newFilters);
  // React Query가 자동으로 새로운 검색 실행
};

// 무한 스크롤 트리거
const handleLoadMore = () => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
};

// 검색 결과 하이라이팅
const highlightedItems = items.map(item => ({
  ...item,
  // TODO: 검색어 하이라이팅 로직 추가
  highlightedTitle: highlightSearchTerm(item.title, searchQuery)
}));
*/