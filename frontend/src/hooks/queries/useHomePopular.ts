/**
 * 홈 - 인기 상영회 React Query 훅
 * 
 * 좋아요, 참여자 수, 조회수 등을 종합한 인기 상영회 목록을 조회합니다.
 * 고정 8개만 노출하며, useQuery를 사용합니다.
 * 
 * queryKey: ['home', 'popular']
 * 반환: ApiSearchItem[] | undefined
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useQuery } from '@tanstack/react-query';
import type { ApiSearchItem } from '@/types/searchApi';
import type { GetPopularFundingResponse } from '@/types/home';
import { getPopularFunding } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';

/**
 * 홈 인기 상영회 조회 훅
 *
 * 인기도 알고리즘(좋아요 수, 참여자 수, 조회수 등)을 적용한 상영회 목록을 반환합니다.
 * 현재는 search?sortBy=POPULAR로 대체
 *
 * @returns 인기 상영회 8개 목록
 */
export function useHomePopular() {
  const { user } = useAuthStore();
  const userId = user?.userId;

  return useQuery({
    queryKey: ['home', 'popular', userId],
    queryFn: async () => {
      return await getPopularFunding(userId);
    },
    select: (data: GetPopularFundingResponse) => {
      return data.data?.slice(0, 8) || [] as ApiSearchItem[];
    },
    staleTime: 60_000,
    gcTime: 300_000,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('401')) {
        return false;
      }
      return failureCount < 2;
    },
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