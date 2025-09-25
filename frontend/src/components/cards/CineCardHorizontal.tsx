import React, { useState } from 'react';
import { HorizontalLeft } from './sections/HorizontalLeft';
import { HorizontalRight } from './sections/HorizontalRight';
import { PerforationLine } from './primitives/PerforationLine';
import { ApiSearchItem, FundingType, FundingState } from '@/types/searchApi';
import { addFundingLike, deleteFundingLike } from '@/api/likes';
import { useAuthStore } from '@/stores/authStore';

type CineCardProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  onCardClick?: (id: number) => void;
  onVoteClick?: (id: number) => void;
  showStateTag?: boolean;
  stateTagClassName?: string;
  getStateBadgeInfo?: (state: FundingState, fundingType: FundingType) => { text: string; className: string };
  backgroundColor?: 'bg-BG-0' | 'bg-BG-1';
};

const CineCardHorizontal: React.FC<CineCardProps> = ({ data, loadingState = 'ready', onVoteClick, onCardClick, showStateTag = false, stateTagClassName = '', getStateBadgeInfo, backgroundColor = 'bg-BG-1' }) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  // 좋아요 토글을 위한 상태 관리
  const { user } = useAuthStore();
  const userId = user?.userId?.toString();

  // 로컬 상태로 좋아요 상태 관리
  const [localIsLiked, setLocalIsLiked] = useState(data.funding.isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(data.funding.favoriteCount);
  const [isLoading, setIsLoading] = useState(false);

  // 현재 좋아요 상태와 좋아요 수
  const currentIsLiked = localIsLiked;
  const currentLikeCount = localLikeCount;

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

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 로그인 체크
    if (!userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    setIsLoading(true);

    // 낙관적 업데이트 - 즉시 로컬 상태 변경
    setLocalIsLiked(!currentIsLiked);
    setLocalLikeCount(currentIsLiked ? currentLikeCount - 1 : currentLikeCount + 1);

    try {
      // API 호출
      if (currentIsLiked) {
        await deleteFundingLike(data.funding.fundingId, userId);
      } else {
        await addFundingLike(data.funding.fundingId, userId);
      }
    } catch (error) {
      // 에러 시 롤백
      setLocalIsLiked(currentIsLiked);
      setLocalLikeCount(currentLikeCount);
      console.error('좋아요 토글 실패:', error);
      alert('좋아요 처리 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }

    // 기존 onVoteClick 콜백도 호출 (필요시)
    if (onVoteClick) {
      onVoteClick(data.funding.fundingId);
    }
  };

  // 펀딩 타입별 종료 상태 확인
  const isEnded = isFunding
    ? ['SUCCESS', 'FAILED'].includes(data.funding.state) // 펀딩: 성공, 실패
    : data.funding.state === 'WAITING'; // 투표: 오픈대기

  return (
    <div className={`w-full flex items-start cursor-pointer hover:bg-slate-800/50 transition-color hover:scale-[1.02] min-w-[300px] ${isEnded ? 'opacity-30' : ''}`} onClick={handleCardClick}>
      {/* 왼쪽(이미지+영화제목+지역+상영일+프로젝트제목) */}
      <HorizontalLeft
        data={data}
        loadingState={loadingState}
        formatDate={formatDate}
        isFunding={isFunding}
        currentIsLiked={currentIsLiked}
        isLoading={isLoading}
        onVoteClick={handleVoteClick}
        showStateTag={showStateTag}
        getStateBadgeInfo={getStateBadgeInfo}
        backgroundColor={backgroundColor}
      />
      {/* 경계선 */}
      <div className="self-stretch w-[1px] py-2">
        <PerforationLine orientation="vertical" />
      </div>
      {/* 오른쪽(가격+달성률+현재인원/목표인원+-일남음+진행률바) */}
      {/* 투표면 좋아요수+버튼 */}
      <HorizontalRight data={data} loadingState={loadingState} onVoteClick={onVoteClick} currentIsLiked={currentIsLiked} currentLikeCount={currentLikeCount} isLoading={isLoading} backgroundColor={backgroundColor} />
    </div>
  );
};

export { CineCardHorizontal };
export type { CineCardProps };
