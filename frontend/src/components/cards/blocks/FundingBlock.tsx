import React from 'react';
import { Progress } from '../primitives/Progress';
import { Skeleton } from '@/components/ui/skeleton';

type FundingBlockProps = {
  price: number;
  progressRate: number;
  participantCount: number;
  maxPeople: number;
  fundingEndsOn: string;
  loadingState?: 'ready' | 'loading';
};

const FundingBlock: React.FC<FundingBlockProps> = ({
  price,
  progressRate,
  participantCount,
  maxPeople,
  fundingEndsOn,
  loadingState = 'ready',
}) => {
  const formatNumber = (num: number) => {
    return num.toLocaleString('ko-KR');
  };

  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(fundingEndsOn);

  if (loadingState === 'loading') {
    return (
      <div className="space-y-1">
        <Skeleton className="h-6 w-full" />
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-1 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* 가격 */}
      <div className="text-base text-slate-50 font-semibold leading-normal">{formatNumber(price)} 원</div>

      {/* 메타 정보 */}
      <div className="flex justify-between items-center text-xs font-semibold">
        <div>
          <span className="text-red-400 leading-none">{Math.round(progressRate)}%</span>
          <span className="text-slate-400 text-[10px] font-normal leading-3">
            {formatNumber(participantCount)}/{formatNumber(maxPeople)}
          </span>
        </div>
        <div className="text-slate-50 leading-none">{daysLeft}일 남음</div>
      </div>

      {/* 진행률 바 */}
      <Progress value={progressRate} height={4} />
    </div>
  );
};

export { FundingBlock };
export type { FundingBlockProps };
