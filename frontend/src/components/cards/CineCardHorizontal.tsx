import React from 'react';
import { HorizontalLeft } from './sections/HorizontalLeft';
import { HorizontalRight } from './sections/HorizontalRight';
import { PerforationLine } from './primitives/PerforationLine';
import { ApiSearchItem, FundingType, FundingState } from '@/types/searchApi';
import { useAuthStore } from '@/stores/authStore';
import { useFundingLike } from '@/hooks/queries/useFunding';

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

  // 좋아요 토글을 위한 상태 관리
  const { user } = useAuthStore();
  const userId = user?.userId?.toString();

  // React Query 훅 사용으로 상태 동기화
  const likeMutation = useFundingLike();

  // 현재 좋아요 상태와 좋아요 수 (서버 데이터 기반)
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

    // 로그인 체크
    if (!userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    // React Query mutation 사용으로 상태 동기화
    likeMutation.mutate({
      fundingId: data.funding.fundingId,
      userId,
      isLiked: currentIsLiked,
    });

    // 기존 onVoteClick 콜백도 호출 (필요시)
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
        isLoading={likeMutation.isPending}
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
      <HorizontalRight data={data} loadingState={loadingState} onVoteClick={onVoteClick} currentIsLiked={currentIsLiked} currentLikeCount={currentLikeCount} isLoading={likeMutation.isPending} />
    </div>
  );
};

export { CineCardHorizontal };
export type { CineCardProps };
