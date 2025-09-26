/* eslint-disable @next/next/no-img-element */
import React from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type MediaProps = {
  src: string;
  alt?: string;
  height?: number;
  aspect?: '16/9' | '4/3' | '1/1' | '7/10' | 'auto';
  rounded?: boolean;
  radius?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  loadingState?: 'ready' | 'loading' | 'error';
  className?: string;
};

const Media: React.FC<MediaProps> = ({ src, alt = '', height = 570, aspect = '16/9', rounded = true, radius = 'lg', loadingState = 'ready', className }) => {
  const aspectClasses = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
    '7/10': 'aspect-[7/10]',
    auto: '',
  };

  const radiusClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md', 
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
  };

  const baseClasses = cn('w-full overflow-hidden', rounded && radiusClasses[radius], aspect !== 'auto' && aspectClasses[aspect], className);

  if (loadingState === 'loading') {
    return <Skeleton className={cn(baseClasses)} style={{ height: aspect === 'auto' ? height : undefined }} />;
  }

  if (loadingState === 'error') {
    return (
      <div className={cn(baseClasses, 'bg-slate-700 flex items-center justify-center text-slate-400')} style={{ height: aspect === 'auto' ? height : undefined }}>
        <span className="text-sm">이미지를 불러올 수 없습니다</span>
      </div>
    );
  }

  return (
    <div className={cn(baseClasses, 'relative')} style={{ height: aspect === 'auto' ? height : undefined }}>
      {/* 배경 이미지 (블러 처리) */}
      <img 
        src={src} 
        alt="" 
        className={cn("absolute inset-0 w-full h-full object-cover blur-lg scale-110 opacity-60", rounded && radiusClasses[radius])} 
        aria-hidden="true"
      />
      {/* 메인 이미지 (잘리지 않게) */}
      <img
        src={src} 
        alt={alt} 
        className={cn("relative w-full h-full object-contain bg-transparent", rounded && radiusClasses[radius])} 
      />
    </div>
  );
};

export { Media };
export type { MediaProps };
