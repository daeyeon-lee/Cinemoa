'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Drawer } from 'vaul';
import { X, RefreshCw } from 'lucide-react';

/**
 * 필터링을 위한 바텀시트 컴포넌트
 *
 * 모바일에서 카테고리, 지역, 상영관 종류 필터링을 위한 바텀시트입니다.
 * vaul 라이브러리를 사용하여 스와이프로 닫기 기능을 제공합니다.
 */

interface FilterBottomSheetProps {
  /** 바텀시트 열림/닫힘 상태 */
  isOpen: boolean;
  /** 바텀시트 닫기 핸들러 */
  onClose: () => void;
  /** 바텀시트 제목 */
  title: string;
  /** 바텀시트 내용 */
  children: React.ReactNode;
  /** 필터 적용 핸들러 */
  onApplyFilter: () => void;
  /** 필터 초기화 핸들러 */
  onReset?: () => void;
  /** 초기화 버튼 비활성화 여부 */
  resetDisabled?: boolean;
  /** 적용 버튼 텍스트 (기본값: "필터 적용하기") */
  applyButtonText?: string;
  /** 색상 variant */
  variant?: 'brand1' | 'brand2';
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onApplyFilter,
  onReset,
  resetDisabled = false,
  applyButtonText = '필터 적용하기',
  variant = 'brand1',
}) => {
  return (
    <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Drawer.Portal>
        <Drawer.Title>{title}</Drawer.Title>
        <Drawer.Description className="sr-only">{title} 필터 옵션을 선택하고 적용할 수 있습니다.</Drawer.Description>
        <Drawer.Overlay className="fixed inset-0 bg-black/60 z-50" />
        <Drawer.Content className="bg-BG-1 flex flex-col rounded-t-2xl h-[400px] fixed bottom-0 left-0 right-0 px-6 pb-8 z-50">
          {/* 드래그 핸들 */}
          <div className="mx-auto w-9 h-1 flex-shrink-0 rounded-full bg-BG-2 mb-5 mt-2" />

          {/* 헤더 영역 - 고정 */}
          <div className="flex-shrink-0 flex flex-row items-center justify-between mb-4">
            <Drawer.Title className="text-h5-b text-primary">{title}</Drawer.Title>
            <button onClick={onClose} className="rounded-full hover:bg-gray-100 transition-colors p-1">
              <X size={23} className="text-tertiary" />
            </button>
          </div>

          {/* 컨텐츠 영역 - 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto min-h-0 pr-4 mb-4">{children}</div>

          {/* 버튼 영역 - 고정 */}
          <div className="flex-shrink-0 space-y-3">
            {/* 초기화 버튼 */}
            {onReset && (
              <div className="flex justify-end">
                <Button size="sm" onClick={onReset} className="text-p2-b bg-bg-0 text-tertiary flex items-center gap-1" disabled={resetDisabled}>
                  <RefreshCw size={14} />
                  초기화
                </Button>
              </div>
            )}

            {/* 적용 버튼 */}
            <Button
              onClick={() => {
                onApplyFilter();
                onClose();
              }}
              className="w-full text-white"
              size="lg"
              textSize="lg"
              variant={variant}
            >
              {applyButtonText}
            </Button>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
