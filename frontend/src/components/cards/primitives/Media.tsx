import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type MediaProps = {
  src: string;
  alt?: string;
  height?: number;
  aspect?: '16/9' | '4/3' | '1/1' | 'auto';
  rounded?: boolean;
  loadingState?: 'ready' | 'loading' | 'error';
};

const Media: React.FC<MediaProps> = ({
  src,
  alt = '',
  height = 570,
  aspect = '16/9',
  rounded = true,
  loadingState = 'ready',
}) => {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    auto: '',
  };

  const baseClasses = cn('w-full overflow-hidden', rounded && 'rounded-xl', aspect !== 'auto' && aspectClasses[aspect]);

  if (loadingState === 'loading') {
    return <Skeleton className={cn(baseClasses)} style={{ height: aspect === 'auto' ? height : undefined }} />;
  }

  if (loadingState === 'error') {
    return (
      <div
        className={cn(baseClasses, 'bg-slate-700 flex items-center justify-center text-slate-400')}
        style={{ height: aspect === 'auto' ? height : undefined }}
      >
        <span className="text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ height: aspect === 'auto' ? height : undefined }}
      />
    </div>
  );
};

export { Media };
export type { MediaProps };
