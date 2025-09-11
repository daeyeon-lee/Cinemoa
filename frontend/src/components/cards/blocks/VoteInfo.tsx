import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

type VoteInfoProps = {
  likeCount: number;
  isLiked?: boolean;
  ctaLabel?: string;
  disabled?: boolean;
  loadingState?: 'ready' | 'loading' | 'error';
  onClick?: () => void;
};

const VoteInfo: React.FC<VoteInfoProps> = ({
  likeCount,
  isLiked = false,
  ctaLabel = '보고싶어요',
  disabled = false,
  loadingState = 'ready',
  onClick,
}) => {
  if (loadingState === 'loading') {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <p className="text-xs text-slate-50 font-semibold text-center leading-none">
        {likeCount.toLocaleString()} 명이 {ctaLabel}
      </p>
      <Button
        variant="outline"
        size="md"
        disabled={disabled}
        onClick={onClick}
        className={`w-full gap-1 ${
          isLiked ? 'text-Brand2-Primary border-Brand2-Tertiary' : 'text-slate-400 border-stroke-4'
        }`}
      >
        <span className="text-lg">{isLiked ? '♥' : '♡'}</span>
        {ctaLabel}
      </Button>
    </div>
  );
};

export { VoteInfo };
export type { VoteInfoProps };
