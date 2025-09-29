// components/detail/FundingDetail.tsx
'use client';

import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useFundingDetail } from '@/hooks/queries';
import { FundingDetailCard } from '@/app/(main)/detail/[fundingId]/components/FundingDetailCard';
import FundingDetailInfo from '@/app/(main)/detail/[fundingId]/components/FundingDetailInfo';
import { FundingDetailProvider } from '@/contexts/FundingDetailContext';

interface FundingDetailProps {
  fundingId: string; // 🆕 URL에서 받은 fundingId
  userId?: string; // 🆕 URL에서 받은 userId
  isExpired?: boolean; // 🆕 마감 여부
}

const FundingDetail: React.FC<FundingDetailProps> = ({ fundingId, userId: propUserId, isExpired }) => {
  const { user } = useAuthStore();
  const userId = propUserId || user?.userId?.toString();

  // React Query로 펀딩 상세 데이터 조회
  const {
    data: detailData,
    isLoading,
    error,
    refetch,
  } = useFundingDetail({
    fundingId,
    userId,
  });

  // console.log('FundingDetail - detailData:', detailData);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="p1-b text-secondary">펀딩 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-1">
        <p className="p3-b text-Brand1-Primary">펀딩 정보를 불러오는 중 오류가 발생했습니다.</p>
        <p className="p3-b text-secondary">{error.message}</p>
        <button onClick={() => refetch()} className="px-4 py-2 bg-Brand1-Primary text-white rounded hover:bg-Brand1-Secondary">
          다시 시도
        </button>
      </div>
    );
  }

  // 데이터 없음
  if (!detailData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500">펀딩 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 펀딩 타입이 아닌 경우 (투표 등) - 이제 DetailPageWrapper에서 처리하므로 여기서는 타입 안전
  if (detailData.type !== 'FUNDING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500">펀딩 타입이 아닙니다.</p>
      </div>
    );
  }

  return (
    <FundingDetailProvider data={detailData} userId={userId}>
      <div className="flex flex-col items-stretch w-full max-w-[1200px] min-w-0">
        {/* 상단 카드 */}
        <FundingDetailCard
          fundingId={detailData.funding.fundingId} // 🆕 React Query용 ID 전달
          isExpired={isExpired} // 🆕 마감 여부 전달
        />

        {/* 상세 정보 */}
        <FundingDetailInfo />
      </div>
    </FundingDetailProvider>
  );
};

export { FundingDetail };
