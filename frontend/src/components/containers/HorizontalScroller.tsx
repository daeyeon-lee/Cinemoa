'use client';

import React, { useRef, useCallback } from 'react';

interface HorizontalScrollerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * 가로 스크롤 가능한 컨테이너 컴포넌트
 *
 * 사용 예시:
 * <HorizontalScroller>
 *   <CineCardVertical data={item1} />
 *   <CineCardVertical data={item2} />
 *   <CineCardVertical data={item3} />
 * </HorizontalScroller>
 */
export default function HorizontalScroller({ children, className = '' }: HorizontalScrollerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!scrollRef.current) return;

    const scrollAmount = 200;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* 우측 gradient overlay */}
      <div className="absolute right-0 top-0 z-10 h-full w-8 bg-gradient-to-l from-slate-900 to-transparent pointer-events-none" />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        role="listbox"
        tabIndex={0}
        className="flex justify-center gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide focus:outline-none"
        onKeyDown={handleKeyDown}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} role="option" className="flex-shrink-0 snap-start">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
