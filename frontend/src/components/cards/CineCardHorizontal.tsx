import React from 'react';
import { HorizontalLeft } from './sections/HorizontalLeft';
import { HorizontalRight } from './sections/HorizontalRight';
import { PerforationLine } from './primitives/PerforationLine';
import { ApiSearchItem } from '@/types/searchApi';

type CineCardProps = {
  data: ApiSearchItem;
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
    <div className="w-full flex items-start cursor-pointer hover:bg-slate-800/50 transition-color hover:scale-[1.02]" onClick={handleCardClick}>
      {/* 왼쪽(이미지+영화제목+지역+상영일+프로젝트제목) */}
      <HorizontalLeft data={data} loadingState={loadingState} formatDate={formatDate} />
      {/* 경계선 */}
      <div className="self-stretch w-[1px] py-2">
        <PerforationLine orientation="vertical" />
      </div>
      {/* 오른쪽(가격+달성률+현재인원/목표인원+-일남음+진행률바) */}
      {/* 투표면 좋아요수+버튼 */}
      <HorizontalRight data={data} loadingState={loadingState} onVoteClick={onVoteClick} />
    </div>
  );
};

export { CineCardHorizontal };
export type { CineCardProps };
