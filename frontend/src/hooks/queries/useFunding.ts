/**
 * 펀딩 상태관리 통합 훅
 * 
 * 3개 API (리스트조회, 상세조회, 좋아요추가/취소)를 사용해서
 * userId, isLiked, likeCount, isParticipated 상태를 관리합니다.
 * 
 * 공통 상태 (userId, isLiked, likeCount): 리스트 ↔ 상세 동기화
 * 상세 전용 (isParticipated): 상세에서만 사용, 동기화 시 보존
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getFundingList } from '@/api/fundingList';  // 🚧 임시 주석: 리스트는 다른 팀원 작업 중
import { getFundingDetail } from '@/api/fundingDetail';
import { addFundingLike, deleteFundingLike } from '@/api/fundingActions'; // ✅ 분리된 API 불러오기
import type { ApiResponse, DetailData } from '@/types/fundingDetail';


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
      // API 응답을 그대로 반환
      return response.data;
    },
  });
}

// 좋아요 토글 훅 (API 3번: 좋아요 추가/취소 → userId, isLiked, likeCount만 업데이트)
export function useFundingLike() {
  const queryClient = useQueryClient();

  return useMutation({
    // 👉 isLiked를 인자로 받도록 복원
    mutationFn: async ({ fundingId, userId, isLiked }: { 
      fundingId: number; 
      userId: string; 
      isLiked: boolean; // 클릭 직전 상태
    }) => {
      console.log('[MutationFn 호출]', fundingId, userId, '현재 isLiked:', isLiked);

      if (isLiked) {
        // 현재 좋아요 상태 → true → 취소 요청
        return await deleteFundingLike(fundingId, userId);
      } else {
        // 현재 좋아요 상태 → false → 추가 요청
        return await addFundingLike(fundingId, userId);
      }
    },
    
    // Optimistic Update - 즉시 UI 반영
    onMutate: async ({ fundingId, userId, isLiked }) => {
      console.log('🟡 onMutate 실행 - 낙관적 업데이트 시작');
      await queryClient.cancelQueries({ queryKey: ['FUNDING', fundingId.toString(), userId] });

      const previousDetailData = queryClient.getQueryData(['FUNDING', fundingId.toString(), userId]);
      console.log('👉 기존 캐시:', previousDetailData);
      
      queryClient.setQueryData(
        ['FUNDING', fundingId.toString(), userId],
        (old: ApiResponse<DetailData> | undefined) => {
          if (!old || old.data?.type !== 'FUNDING') return old;

          return {
            ...old,
            data: {
              ...old.data,
              stat: {
                ...old.data.stat,
                isLiked: !isLiked, // 클릭한 값 반영
                likeCount: isLiked
                  ? old.data.stat.likeCount - 1
                  : old.data.stat.likeCount + 1,
                isParticipated: old.data.stat.isParticipated,
              }
            }
          };
        }
      );

      return { previousDetailData };
    },

    onError: (err, { fundingId, userId }, context) => {
      console.error('🔴 좋아요 토글 실패:', err);
      if (context?.previousDetailData) {
        queryClient.setQueryData(['FUNDING', fundingId.toString(), userId], context.previousDetailData);
        console.log('🔄 캐시 롤백 완료:', context.previousDetailData);
      }
    },

    onSettled: (data, error, { fundingId, userId }) => {
      console.log('⚪ onSettled 실행 - 서버 데이터 동기화');
      queryClient.invalidateQueries({ queryKey: ['FUNDING', fundingId.toString(), userId] });
    },

    onSuccess: (data, { fundingId }) => {
      console.log('🟢 onSuccess - 서버 응답 성공:', fundingId, data);
    },
  });
}
