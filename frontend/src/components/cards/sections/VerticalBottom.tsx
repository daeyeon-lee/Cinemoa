import React from 'react';
import { FundingInfo } from '../blocks/FundingInfo';
import { VoteInfo } from '../blocks/VoteInfo';
import { ApiSearchItem, FundingType } from '@/types/searchApi';

type VerticalBottomProps = {
  data: ApiSearchItem;
  fundingType: FundingType;
  loadingState?: 'ready' | 'loading' | 'error';
  onVoteClick?: (fundingId: number) => void;
};

const VerticalBottom: React.FC<VerticalBottomProps> = ({ data, fundingType, loadingState = 'ready', onVoteClick }) => {
  const isFunding = fundingType === 'FUNDING';

  if (isFunding) {
    return (
      <FundingInfo
        price={data.funding.price}
        progressRate={data.funding.progressRate}
        participantCount={data.funding.participantCount}
        maxPeople={data.funding.maxPeople}
        fundingEndsOn={data.funding.fundingEndsOn}
        loadingState={loadingState}
      />
    );
  } else {
    const handleVoteClick = () => {
      if (onVoteClick) {
        onVoteClick(data.funding.fundingId);
      }
    };

    return (
      <div onClick={handleVoteClick}>
        <VoteInfo likeCount={data.funding.favoriteCount} isLiked={data.funding.isLiked} loadingState={loadingState} />
      </div>
    );
  }
};

export { VerticalBottom };
export type { VerticalBottomProps };
