/**
 * 홈 - 종료 임박 상영회 React Query 훅
 * 
 * 펀딩 마감일이 임박한 상영회 목록을 조회합니다.
 * 고정 8개만 노출하며, useQuery를 사용합니다.
 * 
 * 더보기 정책:
 * - 홈에서는 8개만 표기
 * - "더보기" 클릭 시 /fundings 페이지로 이동
 * - 이동 시 QueryParams: { sortBy: 'deadline', type: 'funding', isClosed: false, ... }
 * 
 * queryKey: ['home', 'closingSoon']
 * 반환: ApiSearchItem[] | undefined
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useQuery } from '@tanstack/react-query';
import type { ApiSearchItem } from '@/types/searchApi';
import { getExpiringSoonFunding } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';

/**
 * 홈 종료 임박 상영회 조회 훅
 *
 * 마감일이 임박한 순서로 정렬된 상영회 목록을 반환합니다.
 * 현재는 search?sortBy=RECOMMENDED로 5개 대체
 *
 * @returns 종료 임박 상영회 5개 목록
 */
export function useHomeClosingSoon() {
  const { user } = useAuthStore();
  const userId = user?.userId;

  return useQuery({
    queryKey: ['home', 'closingSoon', userId],
    queryFn: async () => {
      return await getExpiringSoonFunding(userId);
    },
    select: (data) => {
      return data.data?.slice(0, 5) || [] as ApiSearchItem[];
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

/**
 * 종료 임박 더보기 페이지로 이동할 때 사용할 QueryParams 생성
 */
export const getClosingSoonMoreParams = () => ({
  sortBy: 'deadline' as const,
  type: 'funding' as const,
  isClosed: false,
  page: 0,
  size: 20,
});

/*
사용 예시:

// 홈 컴포넌트에서
const { data: closingSoonItems, isLoading, error } = useHomeClosingSoon();

// 더보기 핸들러
const handleMoreClick = () => {
  const params = getClosingSoonMoreParams();
  router.push(`/fundings?${new URLSearchParams(params).toString()}`);
};

// 섹션 컴포넌트에 전달
<ClosingSoonSection 
  title="종료 임박 상영회"
  items={closingSoonItems || []}
  loading={isLoading}
  onMoreClick={handleMoreClick}
/>
*/