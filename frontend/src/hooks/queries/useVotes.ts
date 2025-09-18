/**
 * 이거어때 - 투표 목록 React Query 훅 (무한 스크롤)
 * 
 * 사용자 투표를 위한 제안 상영회 목록을 조회합니다.
 * useInfiniteQuery를 사용하여 무한 스크롤을 지원합니다.
 * 
 * queryKey: ['votes', paramsWithoutPage]
 * 반환: { items: CardItem[]; fetchNextPage; hasNextPage; isFetchingNextPage; ... }
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useInfiniteQuery } from '@tanstack/react-query';
import type { QueryParams } from '@/types/query';
import type { CardItem } from '@/types/cardItem';
import { mapFundingDtoToCardItem } from '@/mappers/cardItemMapper';

interface UseVotesParams extends Omit<QueryParams, 'page' | 'type'> {
  // page와 type은 제외 (투표는 항상 type: 'vote')
}

/**
 * 투표 목록 조회 훅 (무한 스크롤)
 * 
 * 투표 상태인 상영회 제안 목록을 조회합니다.
 * 투표 종료일 기준 정렬과 지역별 필터링을 지원합니다.
 * 
 * @param params - 쿼리 파라미터 (page, type 제외)
 * @returns 무한 스크롤 가능한 투표 목록과 페이징 핸들러
 */
export function useVotes(params: UseVotesParams = {}) {
  // page를 제외한 파라미터만 queryKey에 포함
  const { size = 20, sortBy = 'deadline', ...paramsWithoutPage } = params;

  return useInfiniteQuery({
    queryKey: ['votes', paramsWithoutPage],
    queryFn: async ({ pageParam = 0 }) => {
      // TODO: 서비스 함수 연결
      // return await getVotes({ 
      //   ...params,
      //   type: 'vote', // 투표만 조회
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
    staleTime: 60_000, // 1분
    gcTime: 300_000,   // 5분
    retry: 1,
  });
}

/*
사용 예시:

// 이거어때 페이지에서
const { 
  data, 
  fetchNextPage, 
  hasNextPage, 
  isFetchingNextPage,
  isLoading,
  error 
} = useVotes({
  sortBy: 'deadline',
  category: '뮤지컬',
  region: '서울시 강남구',
  size: 20
});

const items = data?.items || [];

// 투표 상태 확인
const voteItems = items.filter(item => item.kind === 'vote');

// 무한 스크롤 트리거
const handleLoadMore = () => {
  if (hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }
};

// 지역 필터 변경
const handleRegionChange = (region: string) => {
  // 새로운 지역으로 params 업데이트
  // React Query가 자동으로 새로운 쿼리 실행
};
*/