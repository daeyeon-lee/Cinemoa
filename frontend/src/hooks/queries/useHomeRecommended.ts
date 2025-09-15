/**
 * 홈 - 추천 상영회 React Query 훅
 * 
 * 사용자 개인화 기반 추천 상영회 목록을 조회합니다.
 * 고정 8개만 노출하며, useQuery를 사용합니다.
 * 
 * queryKey: ['home', 'recommended', userId]
 * 반환: CardItem[] | undefined
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useQuery } from '@tanstack/react-query';
import type { CardItem } from '@/types/cardItem';
import { mapFundingDtoToCardItem } from '@/mappers/cardItemMapper';

interface UseHomeRecommendedParams {
  /** 개인화를 위한 사용자 ID (필수) */
  userId: number;
}

/**
 * 홈 추천 상영회 조회 훅
 * 
 * @param params - 사용자 ID를 포함한 파라미터
 * @returns 추천 상영회 8개 목록
 */
export function useHomeRecommended({ userId }: UseHomeRecommendedParams) {
  return useQuery({
    queryKey: ['home', 'recommended', userId],
    queryFn: async () => {
      // TODO: 서비스 함수 연결
      // return await getHomeRecommended({ userId, type: 'all', sortBy: 'popular', size: 8 });
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
    enabled: !!userId, // userId가 있을 때만 요청
  });
}

/*
사용 예시:

// 홈 컴포넌트에서
const { data: recommendedItems, isLoading, error } = useHomeRecommended({ 
  userId: user.id 
});

// 섹션 컴포넌트에 전달
<RecommendedSection 
  title="추천 상영회"
  items={recommendedItems || []}
  loading={isLoading}
/>
*/