import React from 'react';
import { HorizontalLeft } from './sections/HorizontalLeft';
import { HorizontalRight } from './sections/HorizontalRight';
import { PerforationLine } from './primitives/PerforationLine';
import { FundingData, VoteData, ListCardData } from './CineCardVertical';

type CineCardProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  onCardClick?: (id: number) => void;
  onVoteClick?: (id: number) => void;
};

const CineCardHorizontal: React.FC<CineCardProps> = ({ data, loadingState = 'ready', onVoteClick, onCardClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatLocation = (city: string, district: string) => {
    return `${city} ${district}`;
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(data.funding.fundingId);
    }
  };

  return (
    <div
      className="w-96 inline-flex justify-center items-start cursor-pointer hover:bg-slate-800/50 transition-colors rounded-lg"
      onClick={handleCardClick}
    >
      <HorizontalLeft 
        data={data} 
        loadingState={loadingState} 
        formatLocation={formatLocation} 
        formatDate={formatDate} 
      />
      <div className="self-stretch">
        <PerforationLine orientation="vertical" />
      </div>
      <HorizontalRight data={data} loadingState={loadingState} onVoteClick={onVoteClick} />
    </div>
  );
};

export { CineCardHorizontal };
export type { CineCardProps, FundingData, VoteData };