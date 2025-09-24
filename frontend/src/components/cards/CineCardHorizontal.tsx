import React from 'react';
import { HorizontalLeft } from './sections/HorizontalLeft';
import { HorizontalRight } from './sections/HorizontalRight';
import { PerforationLine } from './primitives/PerforationLine';
import { ApiSearchItem, FundingType, FundingState } from '@/types/searchApi';

type CineCardProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  onCardClick?: (id: number) => void;
  onVoteClick?: (id: number) => void;
  showStateTag?: boolean;
  stateTagClassName?: string;
  getStateBadgeInfo?: (state: FundingState, fundingType: FundingType) => { text: string; className: string };
};

const CineCardHorizontal: React.FC<CineCardProps> = ({ data, loadingState = 'ready', onVoteClick, onCardClick, showStateTag = false, stateTagClassName = '', getStateBadgeInfo }) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  // ✅ props로만 제어 - React Query 캐시에서 오는 값 사용
  const currentIsLiked = data.funding.isLiked;
  const currentLikeCount = data.funding.favoriteCount;

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

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // ✅ 단순히 부모의 핸들러만 호출 - 모든 로직은 부모에서 처리
    if (onVoteClick) {
      onVoteClick(data.funding.fundingId);
    }
  };

  return (
    <div className="w-full flex items-start cursor-pointer hover:bg-slate-800/50 transition-color hover:scale-[1.02] min-w-[300px]" onClick={handleCardClick}>
      {/* 왼쪽(이미지+영화제목+지역+상영일+프로젝트제목) */}
      <HorizontalLeft
        data={data}
        loadingState={loadingState}
        formatDate={formatDate}
        isFunding={isFunding}
        currentIsLiked={currentIsLiked}
        isLoading={false}
        onVoteClick={handleVoteClick}
        showStateTag={showStateTag}
        getStateBadgeInfo={getStateBadgeInfo}
      />
      {/* 경계선 */}
      <div className="self-stretch w-[1px] py-2">
        <PerforationLine orientation="vertical" />
      </div>
      {/* 오른쪽(가격+달성률+현재인원/목표인원+-일남음+진행률바) */}
      {/* 투표면 좋아요수+버튼 */}
      <HorizontalRight data={data} loadingState={loadingState} onVoteClick={onVoteClick} currentIsLiked={currentIsLiked} currentLikeCount={currentLikeCount} isLoading={false} />
    </div>
  );
};

export { CineCardHorizontal };
export type { CineCardProps };
