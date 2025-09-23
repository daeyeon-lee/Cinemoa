/**
 * 홈 - 추천 상영회 React Query 훅
 *
 * 사용자 개인화 기반 추천 상영회 목록을 조회합니다.
 * 고정 8개만 노출하며, useQuery를 사용합니다.
 *
 * queryKey: ['home', 'recommended', userId]
 * 반환: ApiSearchItem[] | undefined
 *
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useQuery } from '@tanstack/react-query';
import type { ApiSearchItem, ApiSearchResponse } from '@/types/searchApi';
import { getRecommendedFunding } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';

/**
 * 홈 추천 상영회 조회 훅
 *
 * authStore에서 사용자 정보를 직접 가져와서 사용
 * 로그인시: 사용자 맞춤 추천, 비로그인시: 인기 펀딩
 *
 * @returns 추천 상영회 8개 목록
 */
export function useHomeRecommended() {
  const { user } = useAuthStore();
  const userId = user?.userId;

  return useQuery({
    queryKey: ['home', 'recommended', userId],
    queryFn: async () => {
      return await getRecommendedFunding(userId);
    },
    select: (data: ApiSearchResponse) => {
      return data.data?.content?.slice(0, 8) || ([] as ApiSearchItem[]);
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

// authStore에서 자동으로 사용자 정보 가져옴
// 비로그인: 인기 펀딩, 로그인: 맞춤 추천
const { data: recommendedItems, isLoading } = useHomeRecommended();

// 섹션 컴포넌트에 전달
<RecommendedSection
  title="추천 상영회"
  items={recommendedItems || []}
  loading={isLoading}
/>
*/
