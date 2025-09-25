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
    mutationKey: ['fundingLike'],
    // 👉 isLiked를 인자로 받도록 복원
    mutationFn: async ({ fundingId, userId, isLiked }: { 
      fundingId: number; 
      userId: string; 
      isLiked: boolean; // 클릭 직전 상태
    }) => {
      console.log('[MutationFn 호출]', fundingId, userId, '현재 isLiked:', isLiked);

      // ✅ 중복 요청 방지: 동일한 fundingId+userId 조합에 대한 요청이 이미 진행 중인지 확인
      const existingMutation = queryClient.getMutationCache().find({
        predicate: (mutation) => {
          const state = mutation.state;
          return state.status === 'pending' && 
                 mutation.options.mutationKey?.[0] === 'fundingLike' &&
                 mutation.options.mutationKey?.[1] === fundingId &&
                 mutation.options.mutationKey?.[2] === userId;
        }
      });

      if (existingMutation) {
        console.log('React Query 레벨 중복 요청 방지:', { fundingId, userId });
        throw new Error('이미 진행 중인 요청입니다.');
      }

      if (isLiked) {
        // 현재 좋아요 상태 → true → 취소 요청
        return await deleteFundingLike(fundingId, userId);
      } else {
        // 현재 좋아요 상태 → false → 추가 요청
        return await addFundingLike(fundingId, userId);
      }
    },
    
    // ✅ 중복 요청 방지 옵션들
    retry: false, // 재시도 비활성화
    retryDelay: 0, // 재시도 지연 시간 0
    networkMode: 'online', // 온라인일 때만 실행
    
    // Optimistic Update - 즉시 UI 반영
    onMutate: async ({ fundingId, userId, isLiked }) => {
      console.log('🟡 onMutate 실행 - 낙관적 업데이트 시작');
      
      // 상세 페이지 캐시 취소
      await queryClient.cancelQueries({ queryKey: ['DETAIL', fundingId.toString(), userId] });
      
      // 목록 페이지 캐시들도 취소 (홈, 카테고리, 검색, 마이페이지 등)
      await queryClient.cancelQueries({ queryKey: ['home'] });
      await queryClient.cancelQueries({ queryKey: ['category'] });
      await queryClient.cancelQueries({ queryKey: ['search'] });
      await queryClient.cancelQueries({ queryKey: ['SEARCH'] });
      await queryClient.cancelQueries({ queryKey: ['recentlyViewed'] });
      await queryClient.cancelQueries({ queryKey: ['mypage'] });
      await queryClient.cancelQueries({ queryKey: ['user'] });

      const previousDetailData = queryClient.getQueryData(['DETAIL', fundingId.toString(), userId]);
      console.log('👉 기존 상세 캐시:', previousDetailData);
      
      // 상세 페이지 캐시 업데이트
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

      // 목록 페이지 캐시들도 업데이트
      const updateListCache = (queryKey: string[]) => {
        queryClient.setQueryData(queryKey, (old: any) => {
          if (!old || !old.data || !old.data.content) return old;
          
          return {
            ...old,
            data: {
              ...old.data,
              content: old.data.content.map((item: any) => {
                if (item.funding.fundingId === fundingId) {
                  return {
                    ...item,
                    funding: {
                      ...item.funding,
                      isLiked: !isLiked,
                      favoriteCount: isLiked ? item.funding.favoriteCount - 1 : item.funding.favoriteCount + 1,
                    }
                  };
                }
                return item;
              })
            }
          };
        });
      };

      // 모든 목록 캐시 업데이트
      updateListCache(['home', 'recommended']);
      updateListCache(['home', 'popular']);
      updateListCache(['home', 'closingSoon']);
      updateListCache(['home', 'recentlyViewed']);
      updateListCache(['category']);
      updateListCache(['search']);
      
      // 최근 본 상영회 캐시 업데이트 (동적 쿼리 키 처리)
      const recentlyViewedQueries = queryClient.getQueriesData({ queryKey: ['recentlyViewed'] });
      recentlyViewedQueries.forEach(([queryKey, data]) => {
        if (data && typeof data === 'object' && 'data' in data) {
          const typedData = data as any;
          if (typedData.data && Array.isArray(typedData.data)) {
            const updatedData = {
              ...typedData,
              data: typedData.data.map((item: any) => {
                if (item.funding.fundingId === fundingId) {
                  return {
                    ...item,
                    funding: {
                      ...item.funding,
                      isLiked: !isLiked,
                      favoriteCount: isLiked ? item.funding.favoriteCount - 1 : item.funding.favoriteCount + 1,
                    }
                  };
                }
                return item;
              })
            };
            queryClient.setQueryData(queryKey, updatedData);
          }
        }
      });

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
      // 상세 페이지 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['DETAIL', fundingId.toString(), userId] });
      
      // 목록 페이지 캐시들도 무효화하여 서버 데이터와 동기화
      queryClient.invalidateQueries({ queryKey: ['home'] });
      queryClient.invalidateQueries({ queryKey: ['category'] });
      queryClient.invalidateQueries({ queryKey: ['search'] });
      queryClient.invalidateQueries({ queryKey: ['SEARCH'] });
      queryClient.invalidateQueries({ queryKey: ['recentlyViewed'] });
      queryClient.invalidateQueries({ queryKey: ['mypage'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
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
