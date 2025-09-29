'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  title: string;           // 제목
  subTitle: string;        // 부제목
  content?: string;         // 내용 설명
  info?: string;           // 추가 정보 (선택사항)
  icon?: React.ReactNode;  // 아이콘 (기본 크기 48px, size prop으로 조절 가능)
  negLabel: string;        // 부정적인 버튼 (취소)
  posLabel: string;        // 긍정적인 버튼 (확인)
  onNegative: () => void;  // 취소 버튼 클릭
  onPositive: () => void;  // 확인 버튼 클릭
  isLoading?: boolean;     // 로딩 상태
}

export default function ConfirmDialog({
  title,
  subTitle,
  content,
  info,
  icon,
  negLabel,
  posLabel,
  onNegative,
  onPositive,
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-BG-1 rounded-2xl max-w-md w-full mx-4 p-8 space-y-6">
        {/* 헤더: 제목(왼쪽) + X버튼(오른쪽) */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">
            {title}
          </h2>
          <button 
            onClick={onNegative}
            className="text-tertiary hover:text-primary transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path 
                d="M18 6L6 18M6 6L18 18" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        
        {/* 바디 */}
        <div className="flex flex-col gap-6">
           {/* 아이콘 + subTitle */}
           <div className="flex flex-col items-center gap-3">
             {/* 아이콘 (기본 크기 48px) */}
             {icon && (
               <div className="flex justify-center">
                 <div className="flex items-center justify-center">
                   {React.isValidElement(icon) && typeof icon.type !== 'string' 
                     ? React.cloneElement(icon as React.ReactElement<{size?: number}>, { 
                         size: (icon.props as {size?: number})?.size || 48
                       })
                     : icon}
                 </div>
               </div>
             )}

            {/* subTitle 중앙정렬 */}
            <div className="text-center h5-b text-primary">
              {subTitle}
            </div>
          </div>

          {/* content */}
          {content && (
            <div className="bg-BG-2 rounded-lg px-6 py-4">
              <p className="p2-b text-secondary whitespace-pre-line">
                {content}
              </p>
            </div>
          )}

          {/* info */}
          {/* : •, -, \n 이 포함되어 있으면 왼쪽 정렬, 아니면 중앙 정렬 */}
          {info && (
            <p className={`p2 text-tertiary whitespace-pre-line ${
              info.includes('•') || info.includes('-') || info.includes('\n') || info.length > 50 
                ? 'text-left' 
                : 'text-center'
            }`}>
              {info}
            </p>
          )}
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button 
            variant="secondary" 
            size="lg" 
            textSize="lg"
            className="flex-1"
            onClick={onNegative}
            disabled={isLoading}
          >
            {negLabel}
          </Button>
          <Button 
            variant="brand1" 
            size="lg" 
            textSize="lg"
            className="flex-1"
            onClick={onPositive}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : posLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
