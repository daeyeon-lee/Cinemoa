import React from 'react';
import { FundingInfo } from '../blocks/FundingInfo';
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
  const isFunding = data.type === 'funding';

  return (
    <div className="w-28 self-stretch px-3 pt-3 pb-4 inline-flex flex-col justify-between items-start">
      {isFunding ? (
        <div className="w-full flex flex-col justify-between h-full">
          <div className="text-slate-50 text-base font-semibold font-['Pretendard'] leading-normal">
            {(data as FundingData).funding.price.toLocaleString()} 원
          </div>
          <div className="self-stretch flex flex-col justify-start items-center gap-1">
            <div className="self-stretch flex flex-col justify-start items-start gap-1">
              <div className="inline-flex justify-start items-center gap-1">
                <div className="text-rose-500 text-xs font-semibold font-['Pretendard'] leading-none">
                  {(data as FundingData).funding.progressRate}%
                </div>
                <div className="text-slate-400 text-[10px] font-normal font-['Pretendard'] leading-3">
                  {(data as FundingData).participation.participantCount}/{(data as FundingData).participation.maxPeople}
                </div>
              </div>
              <div className="text-slate-50 text-xs font-semibold font-['Pretendard'] leading-none">
                180일 남음
              </div>
            </div>
            <div className="self-stretch h-1 bg-slate-700 flex flex-col justify-start items-start gap-2">
              <div 
                className="h-1 relative bg-red-500" 
                style={{ width: `${Math.min((data as FundingData).funding.progressRate, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <div onClick={() => onVoteClick && onVoteClick((data as VoteData).vote.voteId)}>
            <VoteInfo
              likeCount={(data as VoteData).participation.likeCount}
              isLiked={(data as VoteData).participation.isLike}
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