/**
 * 펀딩 상태관리 통합 훅
 * 
 * 3개 API (리스트조회, 상세조회, 좋아요토글)를 사용해서
 * userId, isLiked, likeCount, isParticipated 상태를 관리합니다.
 * 
 * 공통 상태 (userId, isLiked, likeCount): 리스트 ↔ 상세 동기화
 * 상세 전용 (isParticipated): 상세에서만 사용, 동기화 시 보존
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getFundingList } from '@/api/fundingList';  // 🚧 임시 주석: 리스트는 다른 팀원 작업 중
import { getFundingDetail } from '@/api/fundingDetail';
import { toggleFundingLike } from '@/api/fundingActions';
import type { ApiResponse, DetailData } from '@/types/fundingDetail';
// import type { SearchParams } from '@/types/searchApi';  // 🚧 임시 주석: 리스트 관련

/*
🚧 임시 주석 처리: 목록 조회 훅 (API 1번: 리스트조회)
리스트 조회는 다른 팀원이 작업 중이므로 Detail 완료 후 연동 예정

// 목록 조회 훅 (API 1번: 리스트조회 → userId, isLiked, likeCount 추출, isParticipated 없음)
export function useFundingList(params: SearchParams = {}) {
  const { size = 20, ...paramsWithoutPage } = params;

  return useInfiniteQuery({
    queryKey: ['fundings', paramsWithoutPage],
    queryFn: async ({ pageParam = 0 }) => {
      return await getFundingList({ 
        ...params, 
        page: pageParam,
        size 
      });
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // API 응답 구조에 맞게 조정 (실제 구조 확인 후 수정 필요)
      if (lastPage?.data?.page) {
        const { number, totalPages } = lastPage.data.page;
        return number + 1 < totalPages ? number + 1 : undefined;
      }
      return undefined;
    },
    select: (data) => ({
      ...data,
      // 목록 아이템들을 평평하게 만들기 (isParticipated 없음)
      items: data.pages.flatMap(page => 
        page?.data?.content?.map((item: any) => ({
          id: item.fundingId || item.id,
          title: item.title,
          isLiked: item.isLiked,
          likeCount: item.likeCount,
          // 기타 목록에 필요한 정보들...
          ...item
        })) || []
      ),
    }),
    staleTime: 60_000, // 1분
    gcTime: 300_000,   // 5분
    retry: 1,
  });
}
*/

// 상세 조회 훅 (API 2번: 상세조회 → userId, isLiked, likeCount, isParticipated 추출)
export function useFundingDetail({ fundingId, userId }: { fundingId: string; userId?: string }) {
  return useQuery({
    queryKey: ['FUNDING', fundingId, userId],
    queryFn: () => getFundingDetail(fundingId, userId), // 2️⃣ 상세 조회 API 호출
    enabled: !!fundingId, // fundingId가 있을 때만 실행
    staleTime: 30_000, // 30초
    gcTime: 300_000,   // 5분
    retry: 1,
    select: (response) => {
      // API 응답을 그대로 반환 (추가 처리 불필요)
      return response.data;
    },
  });
}

// 좋아요 토글 훅 (API 3번: 좋아요토글 → userId, isLiked, likeCount만 업데이트)
export function useFundingLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ fundingId, userId, isLiked }: { 
      fundingId: number; 
      userId: string; 
      isLiked: boolean; 
    }) => toggleFundingLike(fundingId, userId, isLiked), // 3️⃣ 좋아요 토글 API 호출
    
    // Optimistic Update - 즉시 UI 반영
    onMutate: async ({ fundingId, userId, isLiked }) => {
      // 진행 중인 refetch 취소
      await queryClient.cancelQueries({ queryKey: ['FUNDING', fundingId.toString(), userId] });

      // 현재 데이터 백업
      const previousDetailData = queryClient.getQueryData(['FUNDING', fundingId.toString(), userId]);

      // 상세 캐시 업데이트 (userId, isLiked, likeCount만 업데이트, isParticipated는 보존!)
      queryClient.setQueryData(['FUNDING', fundingId.toString(), userId], (old: ApiResponse<DetailData> | undefined) => {
        if (!old) return old;
        
        // 타입 가드: funding 타입인지 확인
        if (old.data?.type !== 'FUNDING') return old;
        
        return {
          ...old,
          data: {
            ...old.data,
            stat: {
              ...old.data.stat,
              // 🎯 업데이트할 3개 상태
              isLiked: !isLiked,
              likeCount: isLiked ? old.data.stat.likeCount - 1 : old.data.stat.likeCount + 1,
              // 🔒 보존할 상태 (건드리지 않음)
              isParticipated: old.data.stat.isParticipated, // 그대로 유지!
            }
          }
        };
      });

      /*
      🚧 임시 주석: 목록 캐시 업데이트는 리스트 작업 완료 후 추가 예정
      
      // 목록 캐시들 업데이트 (isLiked, likeCount만)
      queryClient.setQueriesData(
        { queryKey: ['FUNDINGS'] },
        (old: any) => { // TODO: 목록 타입 정의 후 수정 필요
          if (!old?.pages) return old;
          
          return {
            ...old,
            pages: old.pages.map((page) => ({
              ...page,
              data: {
                ...page.data,
                content: page.data?.content?.map((item) => {
                  // fundingId 매칭 확인
                  if (item.fundingId === fundingId || item.id === fundingId) {
                    return {
                      ...item,
                      isLiked: !isLiked,
                      likeCount: isLiked ? (item.likeCount || 0) - 1 : (item.likeCount || 0) + 1,
                    };
                  }
                  return item;
                }),
              },
            })),
          };
        }
      );
      */

      return { previousDetailData };
    },

    // 에러 시 롤백
    onError: (err, { fundingId, userId }, context) => {
      console.error('좋아요 토글 실패:', err);
      
      // 백업된 데이터로 복원
      if (context?.previousDetailData) {
        queryClient.setQueryData(['FUNDING', fundingId.toString(), userId], context.previousDetailData);
      }
    },

    // 성공/실패 관계없이 최종 refetch (서버와 동기화)
    onSettled: (data, error, { fundingId, userId }) => {
      // 상세 데이터 최신화
      queryClient.invalidateQueries({ 
        queryKey: ['FUNDING', fundingId.toString(), userId] 
      });
      
      /*
      🚧 임시 주석: 목록 데이터 최신화는 리스트 작업 완료 후 추가 예정
      
      // 목록 데이터 최신화
      queryClient.invalidateQueries({ 
        queryKey: ['FUNDINGS'] 
      });
      */
    },

    onSuccess: (data, { fundingId }) => {
      console.log('좋아요 토글 성공:', fundingId);
    },
  });
}
