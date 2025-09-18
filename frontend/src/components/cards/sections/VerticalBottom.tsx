import React from 'react';
import { FundingInfo } from '../blocks/FundingInfo';
import { VoteInfo } from '../blocks/VoteInfo';
import { FundingData, VoteData } from '../CineCardVertical';

type VerticalBottomProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  onVoteClick?: (fundingId: number) => void;
};

const VerticalBottom: React.FC<VerticalBottomProps> = ({
  data,
  loadingState = 'ready',
  onVoteClick
}) => {
  const isFunding = data.type === 'funding';

  if (isFunding) {
    const fundingData = data as FundingData;
    return (
      <FundingInfo
        price={fundingData.funding.price}
        progressRate={fundingData.funding.progressRate}
        participantCount={fundingData.participation.participantCount}
        maxPeople={fundingData.participation.maxPeople}
        fundingEndsOn={fundingData.funding.fundingEndsOn}
        loadingState={loadingState}
      />
    );
  } else {
    const voteData = data as VoteData;
    const handleVoteClick = () => {
      if (onVoteClick) {
        onVoteClick(voteData.vote.voteId);
      }
    };

    return (
      <div onClick={handleVoteClick}>
        <VoteInfo
          likeCount={voteData.participation.likeCount}
          isLiked={voteData.participation.isLike}
          loadingState={loadingState}
        />
      </div>
    );
  }
};

export { VerticalBottom };
export type { VerticalBottomProps };