/**
 * 홈 - 인기 상영회 React Query 훅
 * 
 * 좋아요, 참여자 수, 조회수 등을 종합한 인기 상영회 목록을 조회합니다.
 * 고정 8개만 노출하며, useQuery를 사용합니다.
 * 
 * queryKey: ['home', 'popular']
 * 반환: CardItem[] | undefined
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useQuery } from '@tanstack/react-query';
import type { CardItem } from '@/types/cardItem';
import { mapFundingDtoToCardItem } from '@/mappers/cardItemMapper';

interface UseHomePopularParams {
  /** 카테고리 필터 (선택사항) */
  category?: string;
}

/**
 * 홈 인기 상영회 조회 훅
 * 
 * 인기도 알고리즘(좋아요 수, 참여자 수, 조회수 등)을 적용한 상영회 목록을 반환합니다.
 * 
 * @param params - 카테고리 필터 등의 파라미터 (선택사항)
 * @returns 인기 상영회 8개 목록
 */
export function useHomePopular(params: UseHomePopularParams = {}) {
  const { category } = params;

  return useQuery({
    queryKey: ['home', 'popular', { category }],
    queryFn: async () => {
      // TODO: 서비스 함수 연결
      // return await getHomePopular({ 
      //   type: 'all', 
      //   sortBy: 'popular', 
      //   category,
      //   size: 8 
      // });
      throw new Error('Service not implemented yet');
    },
    select: (data) => {
      // TODO: API 응답 구조에 맞게 수정
      // return data.data.content.slice(0, 8).map(item => 
      //   mapFundingDtoToCardItem({ funding: item.funding, cinema: item.cinema })
      // );
      return [] as CardItem[];
    },
    staleTime: 60_000, // 1분
    gcTime: 300_000,   // 5분
    retry: 1,
  });
}

/*
사용 예시:

// 홈 컴포넌트에서
const { data: popularItems, isLoading, error } = useHomePopular();

// 카테고리 필터 적용
const { data: moviePopularItems } = useHomePopular({ category: '영화' });

// 섹션 컴포넌트에 전달
<PopularSection 
  title="인기 상영회"
  items={popularItems || []}
  loading={isLoading}
/>
*/