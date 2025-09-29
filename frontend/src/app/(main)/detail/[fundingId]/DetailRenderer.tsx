'use client';

import React, { useEffect, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRecentViewStore } from '@/stores/recentViewStore';
import { useFundingDetail } from '@/hooks/queries';
import { FundingDetail } from './FundingDetail';
import { VoteDetail } from './VoteDetail';

import type { DetailData } from '@/types/fundingDetail';
import InfoIcon from '@/components/icon/infoIcon';

interface DetailRendererProps {
  fundingId: string;
  userId?: string;
}

/**
 * 데이터 조회 후 타입에 따라 펀딩/투표 컴포넌트를 분기 렌더링하는 래퍼
 */
export const DetailRenderer: React.FC<DetailRendererProps> = ({ fundingId, userId: propUserId }) => {
  const { user } = useAuthStore();
  const { addRecentView } = useRecentViewStore();
  const userId = propUserId || user?.userId?.toString();

  // 페이지 방문 시 최근 본 상영회에 추가
  useEffect(() => {
    const fundingIdNum = parseInt(fundingId, 10);
    if (!isNaN(fundingIdNum)) {
      addRecentView(fundingIdNum);
    }
  }, [fundingId, addRecentView]);

  // React Query로 펀딩/투표 상세 데이터 조회
  const {
    data: detailData,
    isLoading,
    error,
    refetch,
  } = useFundingDetail({
    fundingId,
    userId,
  });

  // 마감 여부 판단 로직
  const isExpired = useMemo(() => {
    if (!detailData) return false;

    const endDate = new Date(detailData.funding.fundingEndsOn);
    const today = new Date();

    // 시간을 제거하고 날짜만 비교 (오늘까지 포함)
    today.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    return endDate < today;
  }, [detailData]);

  // console.log('DetailPageWrapper - detailData:', detailData);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <p className="p1-b text-secondary">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-2">
        <p className="p1-b text-Brand1-Primary">데이터를 불러오는 중 오류가 발생했습니다.</p>
        <p className="p1- text-secondary">{error.message}</p>
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
        <p className="p1-b text-secondary">데이터를 찾을 수 없습니다.</p>
      </div>
    );
  }

  // 🎯 타입에 따른 분기 처리 + 마감 처리
  const renderDetailContent = () => {
    if (detailData.type === 'FUNDING') {
      return <FundingDetail fundingId={fundingId} userId={userId} isExpired={isExpired} />;
    } else if (detailData.type === 'VOTE') {
      return <VoteDetail fundingId={fundingId} userId={userId} isExpired={isExpired} />;
    }

    // 알 수 없는 타입
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <p className="p1-b text-secondary">알 수 없는 데이터 타입입니다.</p>
        <p className="text-sm text-gray-400">Type: {(detailData as DetailData)?.type || 'undefined'}</p>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* 마감 배너 */}
      {isExpired && (
        <div className="bg-slate-700 p-4 mx-4 mb-5 rounded-xl">
          <div className="flex items-center">
            <InfoIcon stroke="#CBD5E1" />
            <p className="text-sm text-primary font-medium ml-3">이미 마감된 {detailData.type === 'FUNDING' ? '상영회' : '수요조사'}입니다.</p>
          </div>
        </div>
      )}

      {/* 메인 컨텐츠 */}
      <div>
        {/* 실제 컨텐츠 - 마감시에도 dimmed 처리 없이 렌더링 */}
        {renderDetailContent()}
      </div>
    </div>
  );
};
