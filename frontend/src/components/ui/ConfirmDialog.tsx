'use client';

import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  title: string;           // 제목
  subTitle: string;        // 부제목
  content: string;         // 내용 설명
  info?: string;           // 추가 정보 (선택사항)
  icon?: React.ReactNode;  // 아이콘 (32x32 권장)
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
      <div className="bg-BG-1 rounded-2xl max-w-md w-full mx-4 p-8">
        {/* 헤더: 제목(왼쪽) + X버튼(오른쪽) */}
        <div className="flex items-center justify-between mb-6">
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
        
        {/* 아이콘 (32x32, 중앙정렬) */}
        {icon && (
          <div className="flex justify-center mb-4">
            <div className="flex items-center justify-center">
              {icon}
            </div>
          </div>
        )}
        
        {/* subTitle 중앙정렬 */}
        <div className="text-center h5-b text-primary mb-6">
          {subTitle}
        </div>

        {/* content */}
          <div className="bg-BG-2 rounded-lg px-6 py-4 mb-6">
            <p className="p2-b text-secondary whitespace-pre-line">
              {content}
            </p>
          </div>

        {/* info*/}
        {info && (
          <p className="p2 text-tertiary whitespace-pre-line mb-6">
            {info}
          </p>
        )}


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
