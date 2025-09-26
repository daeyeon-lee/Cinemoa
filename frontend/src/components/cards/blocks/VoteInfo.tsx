import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type VoteInfoProps = {
  likeCount: number;
  isLiked?: boolean;
  disabled?: boolean;
  loadingState?: 'ready' | 'loading' | 'error';
  onClick?: (e: React.MouseEvent) => void; // 좋아요 토글 클릭 이벤트
};

const VoteInfo: React.FC<VoteInfoProps> = ({ likeCount, isLiked = false, disabled = false, loadingState = 'ready', onClick }) => {
  if (loadingState === 'loading') {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  // isLiked에 따라 텍스트 자동 결정
  const ctaLabel = isLiked ? '보고싶어요 취소' : '보고싶어요';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-caption1-b text-center leading-none">
        {likeCount.toLocaleString()} 명이 보고싶어해요
      </p>
      <Button variant="outline" size="sm" textSize="sm" disabled={disabled} onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }} className={`w-full gap-1 ${isLiked ? 'text-slate-400 border-stroke-4' : 'text-Brand2-Primary text-xs border-Brand2-Tertiary'}`}>
        <span className="text-md">{isLiked ? '♥' : '♡'}</span>
        {ctaLabel}
      </Button>
    </div>
  );
};

export { VoteInfo };
export type { VoteInfoProps };
