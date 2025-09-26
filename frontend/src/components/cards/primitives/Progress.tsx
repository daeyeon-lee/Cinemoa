import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type ProgressProps = {
  value: number;
  height?: number;
  showLabel?: boolean;
  loadingState?: 'ready' | 'loading';
  isExpired?: boolean; // 🆕 마감 여부
};

const Progress: React.FC<ProgressProps> = ({ value, height = 4, showLabel = false, loadingState = 'ready', isExpired }) => {
  const clampedValue = Math.max(0, Math.min(100, value));

  if (loadingState === 'loading') {
    return (
      <div className="w-full">
        {showLabel && <Skeleton className="h-4 w-12 mb-1" />}
        <Skeleton className="w-full" style={{ height }} />
      </div>
    );
  }

  return (
    <div className="w-full">
      {showLabel && <div className="text-xs text-slate-300 mb-1">{clampedValue}%</div>}
      <div className="w-full bg-slate-700 rounded-full overflow-hidden" style={{ height }}>
        <div
          className={cn('h-full transition-all duration-300 ease-out', {
            'bg-slate-500': isExpired, // 마감시 tertiary 색상
            'bg-Brand1-Primary': !isExpired // 기본 브랜드 색상
          })}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export { Progress };
export type { ProgressProps };
