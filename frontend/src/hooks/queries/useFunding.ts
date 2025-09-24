/**
 * 펀딩/투표 상태관리 통합 훅
 * 
 * 3개 API (리스트조회, 상세조회, 좋아요추가/취소)를 사용해서
 * 타입별 상태를 관리합니다.
 * 
 * FUNDING: userId, isLiked, likeCount, isParticipated 관리
 * VOTE: userId, isLiked, likeCount 관리 (isParticipated 없음)
 * 
 * 공통 상태 (userId, isLiked, likeCount): 리스트 ↔ 상세 동기화
 * 펀딩 전용 (isParticipated): 펀딩에서만 사용, 동기화 시 보존
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getFundingDetail } from '@/api/fundingDetail';
import { addFundingLike, deleteFundingLike } from '@/api/likes'; // ✅ 분리된 API 불러오기
import { refundPayment } from '@/api/refund'; // ✅ 환불 API 불러오기
import type { ApiResponse, DetailData } from '@/types/fundingDetail';


// 상세 조회 훅 (API 2번: 상세조회 → userId, isLiked, likeCount, isParticipated 추출)
export function useFundingDetail({ fundingId, userId }: { fundingId: string; userId?: string }) {
  return useQuery({
    queryKey: ['DETAIL', fundingId, userId],
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
      await queryClient.cancelQueries({ queryKey: ['DETAIL', fundingId.toString(), userId] });

      const previousDetailData = queryClient.getQueryData(['DETAIL', fundingId.toString(), userId]);
      console.log('👉 기존 캐시:', previousDetailData);
      
      // ✅ 상세 캐시 갱신
      queryClient.setQueryData(
        ['DETAIL', fundingId.toString(), userId],
        (old: ApiResponse<DetailData> | undefined) => {
          if (!old || !old.data || (old.data.type !== 'FUNDING' && old.data.type !== 'VOTE')) {
            return old;
          }

          // FUNDING/VOTE 공통 처리
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
                // isParticipated는 FUNDING 타입에만 있으므로 기존 값 보존 (VOTE에서는 undefined)
                ...(old.data.type === 'FUNDING' && { isParticipated: old.data.stat.isParticipated }),
              }
            }
          };
        }
      );

      // ✅ 목록 캐시도 함께 갱신 (search 쿼리들)
      queryClient.setQueriesData(
        // ✅ 'search'로 시작하는 모든 목록 쿼리 대상으로
        { predicate: (q) => Array.isArray(q.queryKey) && q.queryKey[0] === 'search' },
        (old: any) => {
          if (!old) return old;

          // 1) 무한 스크롤 형태 (old.pages 존재)
          if (Array.isArray(old.pages)) {
            return {
              ...old,
              pages: old.pages.map((page: any) => {
                // 페이지 스키마가 { data: { content: [...] } } 또는 { content: [...] } 둘 가능성 고려
                const content = page?.data?.content ?? page?.content;
                if (!Array.isArray(content)) return page;

                const nextContent = content.map((item: any) => {
                  // ApiSearchItem 구조: { funding: { fundingId, isLiked, favoriteCount }, cinema: {...} }
                  if (Number(item?.funding?.fundingId) !== fundingId) return item;

                  // 카드의 좋아요/카운트 갱신
                  const updatedFunding = {
                    ...item.funding,
                    isLiked: !isLiked,
                    favoriteCount: isLiked ? item.funding.favoriteCount - 1 : item.funding.favoriteCount + 1,
                  };

                  return {
                    ...item,
                    funding: updatedFunding,
                  };
                });

                // 원래 구조 유지해서 반환
                if (page?.data?.content) return { ...page, data: { ...page.data, content: nextContent } };
                if (page?.content) return { ...page, content: nextContent };
                return page;
              }),
            };
          }

          // 2) 일반 페이지네이션/단일 페이지 형태
          const content = old?.data?.content ?? old?.content;
          if (!Array.isArray(content)) return old;

          const nextContent = content.map((item: any) => {
            if (Number(item?.funding?.fundingId) !== fundingId) return item;

            const updatedFunding = {
              ...item.funding,
              isLiked: !isLiked,
              favoriteCount: isLiked ? item.funding.favoriteCount - 1 : item.funding.favoriteCount + 1,
            };

            return {
              ...item,
              funding: updatedFunding,
            };
          });

          if (old?.data?.content) return { ...old, data: { ...old.data, content: nextContent } };
          if (old?.content) return { ...old, content: nextContent };
          return old;
        }
      );

      return { previousDetailData };
    },

    onError: (err, { fundingId, userId }, context) => {
      console.error('🔴 좋아요 토글 실패:', err);
      if (context?.previousDetailData) {
        queryClient.setQueryData(['DETAIL', fundingId.toString(), userId], context.previousDetailData);
        console.log('🔄 캐시 롤백 완료:', context.previousDetailData);
      }
    },

    onSettled: (data, error, { fundingId, userId }) => {
      console.log('⚪ onSettled 실행 - 서버 데이터 동기화');
      queryClient.invalidateQueries({ queryKey: ['DETAIL', fundingId.toString(), userId] });
    },

    onSuccess: (data, { fundingId }) => {
      console.log('🟢 onSuccess - 서버 응답 성공:', fundingId, data);
    },
  });
}


// 환불 전용 훅 (환불 API + 페이지 새로고침)
export function useFundingRefund() {
  return useMutation({
    mutationFn: async ({ 
      fundingId, 
      userId
    }: { 
      fundingId: number; 
      userId: string; 
    }) => {
      console.log('[환불 API 호출]', fundingId, userId);
      return await refundPayment(fundingId, parseInt(userId));
    },
    
    onError: (err) => {
      console.error('🔴 환불 실패:', err);
      alert('환불 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    },

    onSuccess: (data, { fundingId }) => {
      console.log('🟢 환불 성공:', fundingId);
      // 환불 완료 후 페이지 새로고침으로 최신 상태 반영
      window.location.href = `/detail/${fundingId}`;
    },
  });
}
