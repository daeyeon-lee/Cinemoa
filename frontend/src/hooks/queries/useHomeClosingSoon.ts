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
 * 반환: CardItem[] | undefined
 * 
 * TODO: 서비스 연결, 에러 매핑, mapper 유지
 */

import { useQuery } from '@tanstack/react-query';
import type { CardItem } from '@/types/cardItem';
import { mapFundingDtoToCardItem } from '@/mappers/cardItemMapper';

/**
 * 홈 종료 임박 상영회 조회 훅
 * 
 * 마감일이 임박한 순서로 정렬된 상영회 목록을 반환합니다.
 * 더보기 버튼을 통해 전체 목록 페이지로 이동할 수 있습니다.
 * 
 * @returns 종료 임박 상영회 8개 목록
 */
export function useHomeClosingSoon() {
  return useQuery({
    queryKey: ['home', 'closingSoon'],
    queryFn: async () => {
      // TODO: 서비스 함수 연결
      // return await getHomeClosingSoon({ 
      //   type: 'funding', 
      //   sortBy: 'deadline', 
      //   isClosed: false,
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
    staleTime: 60_000, // 1분 (마감일이 중요하므로 자주 업데이트)
    gcTime: 300_000,   // 5분
    retry: 1,
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