'use client';

import React from 'react';
import { Button, type ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CategoryButtonProps extends Omit<ButtonProps, 'variant'> {
  /** 버튼에 표시될 텍스트 (필수) */
  children: React.ReactNode;
  /** 아이콘 (필수) */
  icon: React.ReactNode;
  /** 선택 상태 */
  selected?: boolean;
  /** 모바일 버전 여부 */
  isMobile?: boolean;
  /** 노치 크기 (기본값: 16px) */
  notchSize?: number;
  /** 컨테이너 배경 클래스 (노치 색상과 맞춤) */
  containerBgClass?: string;
  /** 클릭 핸들러 */
  onClick?: () => void;
  /** 홈에서 사용할 때 동일한 너비로 통일 */
  uniformWidth?: boolean;
}

export function CategoryButton({
  children,
  icon,
  selected = false,
  isMobile = false,
  notchSize = 16,
  containerBgClass = 'bg-BG-0',
  onClick,
  className,
  uniformWidth = false,
  ...props
}: CategoryButtonProps) {
  // 노치의 절반 크기 (버튼 바깥으로 반쯤 겹치게 하기 위함)
  const notchOffset = notchSize / 2;

  // 선택 상태에 따른 스타일 결정
  const getStyles = () => {
    if (selected) {
      return {
        bg: 'bg-BG-2',
        text: 'text-primary',
        iconColor: 'text-Brand1-Primary'
      };
    } else {
      return {
        bg: 'bg-BG-2 hover:bg-Brand1-Primary',
        text: 'text-primary',
        iconColor: 'text-primary'
      };
    }
  };

  const styles = getStyles();

  return (
    <div className="relative inline-flex">
      <Button
        variant="secondary"
        onClick={onClick}
        className={cn(
          // 카테고리 버튼 기본 스타일
          'relative rounded-xl transition-all duration-200',
          // 기본 Button 컴포넌트의 고정 높이 제거
          'h-auto',
          styles.bg,
          styles.text,
          // 모바일/웹 레이아웃
          isMobile 
            ? 'flex-col gap-1 px-4 py-2.5' // 모바일: 세로 정렬
            : 'flex-row gap-1.5 px-5 py-3', // 웹: 가로 정렬
          // 홈에서 동일 너비 적용 (웹/모바일 모두 - 스포츠중계 기준)
          uniformWidth && (isMobile ? 'w-[90px]' : 'w-[130px]'), // 스포츠중계가 가장 긴 텍스트
          className
        )}
        {...props}
      >
        {/* 아이콘 */}
        <div className={cn(
          'relative flex items-center justify-center',
          styles.iconColor,
          isMobile ? 'w-7 h-7' : 'w-5 h-5' // 모바일: 28px, 웹: 20px
        )}>
          {icon}
        </div>
        
        {/* 텍스트 */}
        <div className={cn(
          isMobile ? 'caption1-b' : 'p2-b' // 모바일: caption1-b, 웹: p2-b
        )}>
          {children}
        </div>
      </Button>

      {/* 좌측 노치 */}
      <div
        className={cn(
          'absolute rounded-full pointer-events-none inset-y-1/2 -translate-y-1/2',
          containerBgClass
        )}
        style={{
          width: `${notchSize}px`,
          height: `${notchSize}px`,
          left: `-${notchOffset}px`,
        }}
      />

      {/* 우측 노치 */}
      <div
        className={cn(
          'absolute rounded-full pointer-events-none inset-y-1/2 -translate-y-1/2',
          containerBgClass
        )}
        style={{
          width: `${notchSize}px`,
          height: `${notchSize}px`,
          right: `-${notchOffset}px`,
        }}
      />
    </div>
  );
}