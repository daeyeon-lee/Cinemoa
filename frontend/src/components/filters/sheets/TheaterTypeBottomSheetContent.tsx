'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

/**
 * 상영관 타입 아이템 인터페이스
 */
interface TheaterTypeItem {
  label: string;
  value: string;
}

/**
 * TheaterTypeBottomSheetContent 컴포넌트의 props 타입
 */
interface TheaterTypeBottomSheetContentProps {
  /** 표시할 상영관 타입 목록 */
  types: TheaterTypeItem[];
  /** 현재 선택된 상영관 타입들 (label 기준) */
  value: string[];
  /** 상영관 타입 선택 변경 시 호출되는 콜백 함수 */
  onChange: (value: string[]) => void;
  /** 색상 variant (brand1: 빨간색, brand2: 청록색) */
  variant?: 'brand1' | 'brand2';
}

/**
 * TheaterTypeBottomSheetContent 컴포넌트
 *
 * @description 모바일 바텀시트에서 사용하는 상영관 타입 필터 컴포넌트입니다.
 * 데스크탑 TheaterTypeFilterPanel과 동일한 UI로 다중 선택이 가능합니다.
 */
export const TheaterTypeBottomSheetContent: React.FC<TheaterTypeBottomSheetContentProps> = ({ types, value, onChange, variant = 'brand1' }) => {
  const handleToggle = (label: string) => {
    const isSelected = value.includes(label);
    if (isSelected) {
      onChange(value.filter((v) => v !== label));
    } else {
      onChange([...value, label]);
    }
  };

  return (
    <div className="">
      {types.map((type) => {
        const isSelected = value.includes(type.label);

        return (
          <div key={type.value} className="flex items-center justify-between py-3 border-b border-stroke-3 text-p2 cursor-pointer" onClick={() => handleToggle(type.label)}>
            <Label className="text-p2 cursor-pointer">{type.label}</Label>
            <div
              className={cn(
                'w-4 h-4 rounded-full border-2 cursor-pointer transition-colors flex items-center justify-center',
                isSelected ? (variant === 'brand2' ? 'border-[#2cd8ce] bg-[#2cd8ce]' : 'border-[#e83045] bg-[#e83045]') : 'border-stroke-3 bg-transparent',
              )}
            >
              {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};
