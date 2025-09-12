import React from 'react';
import { VoteInfo } from '../blocks/VoteInfo';
import { FundingData, VoteData } from '../CineCardVertical';

type HorizontalRightProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  onVoteClick?: (fundingId: number) => void;
};

const HorizontalRight: React.FC<HorizontalRightProps> = ({
  data,
  loadingState = 'ready',
  onVoteClick
}) => {
  const isFunding = data.funding.fundingType === 'FUNDING';
  
  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(data.funding.fundingEndsOn);

  return (
    <div className="w-28 self-stretch px-3 pt-3 pb-4 inline-flex flex-col justify-between items-start">
      {isFunding ? (
        <div className="w-full flex flex-col justify-between h-full">
          <div className="text-slate-50 text-base font-semibold font-['Pretendard'] leading-normal">
            {data.funding.price.toLocaleString()} 원
          </div>
          <div className="self-stretch flex flex-col justify-start items-center gap-1">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex justify-start items-center gap-1">
                <div className="text-Brand1-Primary text-xs font-semibold font-['Pretendard'] leading-none">
                  {data.funding.progressRate}%
                </div>
                <div className="text-slate-400 text-[10px] font-normal font-['Pretendard'] leading-3">
                  {data.funding.participantCount}/{data.funding.maxPeople}
                </div>
              </div>
              <div className="text-slate-50 text-xs font-semibold font-['Pretendard'] leading-none">
                {daysLeft}일 남음
              </div>
            </div>
            <div className="self-stretch h-1 bg-slate-700 flex flex-col justify-start items-start gap-2">
              <div 
                className="h-1 relative bg-Brand1-Primary" 
                style={{ width: `${Math.min(data.funding.progressRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div onClick={() => onVoteClick && onVoteClick(data.funding.fundingId)}>
            <VoteInfo
              likeCount={data.funding.favoriteCount}
              isLiked={data.funding.isLiked}
              loadingState={loadingState}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export { HorizontalRight };
export type { HorizontalRightProps };