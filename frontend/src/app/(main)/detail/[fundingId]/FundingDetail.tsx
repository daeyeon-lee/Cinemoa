// components/detail/FundingDetail.tsx
"use client";

import React from "react";
import { useFundingDetail } from "@/hooks/queries";
import { FundingDetailCard } from "@/app/(main)/detail/[fundingId]/components/FundingDetailCard"
import FundingDetailInfo from "@/app/(main)/detail/[fundingId]/components/FundingDetailInfo"

interface FundingDetailProps {
  fundingId: string;                           // 🆕 URL에서 받은 fundingId
  userId?: string;                             // 🆕 URL에서 받은 userId
}

const FundingDetail: React.FC<FundingDetailProps> = ({
  fundingId,
  userId,
}) => {
  // React Query로 펀딩 상세 데이터 조회
  const {
    data: detailData,
    isLoading,
    error,
    refetch
  } = useFundingDetail({
    fundingId,
    userId,
  });

  console.log(detailData);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="text-gray-500">펀딩 정보를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-red-500">펀딩 정보를 불러오는 중 오류가 발생했습니다.</p>
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
        <p className="text-gray-500">펀딩 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 펀딩 타입이 아닌 경우 (투표 등)
  if (detailData.type !== 'FUNDING') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="text-gray-500">펀딩 타입이 아닙니다.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-stretch w-full max-w-[1200px] min-w-0">
      {/* 상단 카드 */}
      <FundingDetailCard
        data={detailData}
        fundingId={detailData.funding.fundingId} // 🆕 React Query용 ID 전달
      />

      {/* 상세 정보 */}
      <FundingDetailInfo data={detailData} />
    </div>
  );
};

export { FundingDetail };
