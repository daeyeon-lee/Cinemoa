'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

/**
 * 필터링을 위한 바텀시트 컴포넌트
 *
 * 모바일에서 카테고리, 지역, 상영관 종류 필터링을 위한 바텀시트입니다.
 * 화면 하단에서 슬라이드업으로 나타나며, 높이는 400px로 고정됩니다.
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
  /** 적용 버튼 텍스트 (기본값: "필터 적용하기") */
  applyButtonText?: string;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({ isOpen, onClose, title, children, onApplyFilter, applyButtonText = '필터 적용하기' }) => {
  // 바텀시트가 열릴 때 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // 컴포넌트 언마운트 시 정리
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 - 클릭하면 바텀시트 닫힘 */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />

      {/* 바텀시트 본체 */}
      <div
        className={`
        fixed bottom-0 left-0 right-0 z-50
        bg-BG-1 rounded-t-2xl
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        h-[400px] flex flex-col
      `}
      >
        {/* 헤더 영역 - 고정 */}
        <div className="flex items-center justify-between px-6 pt-8 pb-4 flex-shrink-0">
          <h3 className="text-h5-b">{title}</h3>
          <button onClick={onClose} className="rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* 컨텐츠 영역 - 스크롤 가능 */}
        <div className="flex-1 overflow-y-auto px-6">{children}</div>

        {/* 버튼 영역 - 고정 */}
        <div className="px-6 pb-8 pt-4 flex-shrink-0">
          <Button
            onClick={() => {
              onApplyFilter();
              onClose();
            }}
            className="w-full"
            size="lg"
            variant="brand1"
          >
            {applyButtonText}
          </Button>
        </div>
      </div>
    </>
  );
};
