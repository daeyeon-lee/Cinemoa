"use client";

import React from "react";
import { useAuthStore } from "@/stores/authStore";
import { useFundingDetail } from "@/hooks/queries";
import { FundingDetail } from "./FundingDetail";
import { VoteDetail } from "./VoteDetail";

import type { DetailData } from "@/types/fundingDetail";

interface DetailRendererProps {
  fundingId: string;
  userId?: string;
}

/**
 * 데이터 조회 후 타입에 따라 펀딩/투표 컴포넌트를 분기 렌더링하는 래퍼
 */
export const DetailRenderer: React.FC<DetailRendererProps> = ({ 
  fundingId, 
  userId: propUserId 
}) => {
  const { user } = useAuthStore();
  const userId = propUserId || user?.userId?.toString();

  // React Query로 펀딩/투표 상세 데이터 조회
  const {
    data: detailData,
    isLoading,
    error,
    refetch
  } = useFundingDetail({
    fundingId,
    userId,
  });

  console.log('DetailPageWrapper - detailData:', detailData);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="text-sm text-gray-500">{error.message}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 데이터 없음
  if (!detailData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500">데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 🎯 타입에 따른 분기 처리
  if (detailData.type === 'FUNDING') {
    return (
      <FundingDetail 
        fundingId={fundingId}
        userId={userId}
      />
    );
  } else if (detailData.type === 'VOTE') {
    return (
      <VoteDetail 
        fundingId={fundingId}
        userId={userId}
      />
    );
  }

  // 알 수 없는 타입
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <p className="text-gray-500">알 수 없는 데이터 타입입니다.</p>
      <p className="text-sm text-gray-400">Type: {(detailData as DetailData)?.type || 'undefined'}</p>
    </div>
  );
};
