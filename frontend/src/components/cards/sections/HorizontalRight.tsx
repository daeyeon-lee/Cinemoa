import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '../primitives/Progress';
import { ApiSearchItem } from '@/types/searchApi';
import { addFundingLike, deleteFundingLike } from '@/api/likes';
import { useAuthStore } from '@/stores/authStore';

type HorizontalRightProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  onVoteClick?: (fundingId: number) => void;
};

const HorizontalRight: React.FC<HorizontalRightProps> = ({ data, loadingState = 'ready', onVoteClick }) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  // 좋아요 토글을 위한 상태 관리
  const { user } = useAuthStore();
  const userId = user?.userId?.toString();

  // 로컬 상태로 좋아요 상태 관리
  const [localIsLiked, setLocalIsLiked] = useState(data.funding.isLiked);
  const [localLikeCount, setLocalLikeCount] = useState(data.funding.favoriteCount);
  const [isLoading, setIsLoading] = useState(false);
  // const [lastRequestTime, setLastRequestTime] = useState<number>(0);

  // 현재 좋아요 상태와 좋아요 수
  const currentIsLiked = localIsLiked;
  const currentLikeCount = localLikeCount;

  const calculateDaysLeft = (endDate: string): number => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(data.funding.fundingEndsOn);

  const handleVoteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // 로그인 체크
    if (!userId) {
      alert('로그인 후 이용해주세요.');
      return;
    }

    // 중복 클릭 방지 (로딩 중이거나 최근 1초 내 요청)
    // const now = Date.now();
    // if (isLoading || (now - lastRequestTime < 1000)) {
    //   console.log('[HorizontalRight] 중복 요청 방지:', { isLoading, timeSinceLastRequest: now - lastRequestTime });
    //   return;
    // }

    setIsLoading(true);
    // setLastRequestTime(now);

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

    // 기존 onVoteClick 콜백도 호출
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
