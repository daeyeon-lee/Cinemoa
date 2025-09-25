import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '../primitives/Progress';
import { ApiSearchItem } from '@/types/searchApi';

type HorizontalRightProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  onVoteClick?: (fundingId: number) => void;
  currentIsLiked?: boolean;
  currentLikeCount?: number;
  isLoading?: boolean;
};

const HorizontalRight: React.FC<HorizontalRightProps> = ({ data, loadingState = 'ready', onVoteClick, currentIsLiked = false, currentLikeCount = 0, isLoading = false }) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(data.funding.fundingEndsOn);

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVoteClick) {
      onVoteClick(data.funding.fundingId);
    }
  };

  return (
    <div className="w-[114px] bg-BG-1 rounded-xl self-stretch p-3 inline-flex flex-col justify-between items-start">
      {/* 펀딩 OR 투표 */}
      {isFunding ? (
        <div className="w-full flex flex-col justify-between h-full">
          {/* 오-상단 :가격 */}
          <div className="text-slate-50 text-p1-b leading-normal">{data.funding.price.toLocaleString()} 원</div>
          {/* 오-하단 */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {/* 진행률, 현재인원/목표인원 */}
            <div className="inline-flex justify-start items-center gap-1">
              <div className="text-Brand1-Strong text-p3-b leading-none">{data.funding.progressRate} %</div>
              <div className="text-secondary text-caption2 leading-3">
                {data.funding.participantCount} / {data.funding.maxPeople}
              </div>
            </div>
            <div className="text-slate-50 text-caption1-b leading-none">{daysLeft}일 남음</div>
            <Progress value={data.funding.progressRate} height={4} />
            <div className="self-stretch  gap-1">{/* 몇일 남았는지 */}</div>
            {/* 진행바 */}
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col justify-between h-full">
          {/* 오-상단 --명이 보고싶어요 */}
          <div className="text-slate-50 text-p2-b leading-normal">
            {currentLikeCount}명이
            <br /> 보고싶어요
          </div>
          {/* 오-하단 */}
          <div className="self-stretch flex flex-col justify-start items-start gap-1">
            {/* 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleVoteClick}
              disabled={isLoading}
              className={`w-full gap-1 ${currentIsLiked ? 'text-Brand2-Primary border-Brand2-Tertiary' : 'text-slate-400 border-stroke-4'}`}
            >
              <span className="text-lg">{currentIsLiked ? '♥' : '♡'}</span>
              보고싶어요
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { HorizontalRight };
export type { HorizontalRightProps };
