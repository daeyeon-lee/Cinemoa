import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type ProgressProps = {
  value: number;
  height?: number;
  showLabel?: boolean;
  loadingState?: 'ready' | 'loading';
};

const Progress: React.FC<ProgressProps> = ({ value, height = 4, showLabel = false, loadingState = 'ready' }) => {
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
          className={cn(
            'h-full bg-Brand1-Primary transition-all duration-300 ease-out',
          )}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
};

export { Progress };
export type { ProgressProps };
