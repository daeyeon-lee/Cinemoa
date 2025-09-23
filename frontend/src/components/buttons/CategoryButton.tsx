'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import type { CategoryValue } from '@/constants/categories';
import { ComponentType } from 'react';

interface CategoryButtonProps {
  children: React.ReactNode;
  icon?: ComponentType<any> | null;
  selected?: boolean;
  page?: 'home' | 'category' | 'vote' | 'search';
  categoryValue?: CategoryValue;
  showNotches?: boolean;
  uniformWidth?: boolean;
  iconColor?: string; // 아이콘 색상을 직접 지정할 수 있는 prop
  uniformHeight?: boolean;
  onClick?: () => void;
  className?: string;
  notchColor?: string;
}

export function CategoryButton({
  children,
  icon,
  selected = false,
  page = 'home',
  categoryValue,
  showNotches = true,
  uniformWidth = false,
  uniformHeight = false,
  iconColor,
  onClick,
  className,
  notchColor = 'bg-BG-0',
}: CategoryButtonProps) {
  const isVotePage = page === 'vote';

  const baseClasses = cn(
    'relative rounded-xl border-0 transition-colors cursor-pointer group',
    // 웹 스타일 (기본) - 가로 배치
    'inline-flex justify-center items-center gap-1.5 px-5 py-3',
    // 모바일 스타일 - 세로 배치
    'max-sm:flex max-sm:flex-col max-sm:px-4 max-sm:py-2.5 max-sm:gap-1',
    // 균일한 폭 설정 (스포츠중계 크기 기준)
    uniformWidth && 'w-36 max-sm:w-20',
    // 균일한 높이 설정
    uniformHeight && 'h-12 max-sm:h-16',
    // 기본 색상
    selected ? (isVotePage ? 'bg-[#2cd8ce] text-primary' : 'bg-[#e83045] text-primary') : 'bg-slate-700 text-primary',
    // 호버 색상
    !selected && (isVotePage ? 'hover:bg-[#2cd8ce] hover:text-primary' : 'hover:bg-[#e83045] hover:text-primary'),
    className,
  );

  const iconClasses = cn(
    // 아이콘 색상 - iconColor prop이 있으면 우선 적용, 없으면 기존 로직 사용
    !iconColor && (isVotePage && !selected ? 'text-[#2cd8ce]' : 'text-[#e83045]'),
    selected && 'text-primary',
    // 그룹 호버 시 아이콘 색상 변경
    !selected && 'group-hover:text-primary',
  );

  const labelClasses = cn(
    // 웹 라벨 크기 (p2-b에 해당하는 클래스) - 기본
    'text-p2-b',
    // 모바일 라벨 크기 (caption1-b에 해당하는 클래스)
    'max-sm:text-caption1-b',
  );

  return (
    <div className="relative flex">
      <button onClick={onClick} className={baseClasses}>
        {icon && (
          <div className={iconClasses}>
            {React.createElement(icon, {
              width: 20,
              height: 20,
              className: 'max-sm:w-7 max-sm:h-7',
              stroke: iconColor || 'currentColor',
              fill: iconColor || 'currentColor',
            })}
          </div>
        )}
        <div className={labelClasses}>{children}</div>
      </button>

      {/* 노치 */}
      {showNotches && (
        <>
          <div className={`absolute rounded-full pointer-events-none top-1/2 -translate-y-1/2 ${notchColor} w-4 h-4 -left-2`} />
          <div className={`absolute rounded-full pointer-events-none top-1/2 -translate-y-1/2 ${notchColor} w-4 h-4 -right-2`} />
        </>
      )}
    </div>
  );
}
