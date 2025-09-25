'use client';

import { Button } from '@/components/ui/button';

interface AlertDialogProps {
  title: string;           // 제목
  content: string;        // 부제목
  info?: string;           // 추가 정보 (선택사항)
  icon?: React.ReactNode;  // 아이콘 (기본 크기 48px, size prop으로 조절 가능)
  btnLabel: string;        // 오른쪽 버튼 
  subBtnLabel?: string;        // 왼쪽 버튼 (필요시 사용)
  onBtnLabel: () => void;  // 오른쪽 버튼 클릭
  onSubBtnLabel?: () => void;  // 왼쪽 버튼 클릭
  isLoading?: boolean;     // 로딩 상태
}

export default function AlertDialog({
  title,
  content,
  info,
  icon,
  btnLabel,
  subBtnLabel,
  onBtnLabel,
  onSubBtnLabel,
  isLoading = false,
}: AlertDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="bg-BG-1 rounded-2xl max-w-md w-full mx-4 p-8">
        {/* 헤더: 제목(왼쪽) + X버튼(오른쪽) */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-primary">
            {title}
          </h2>
          <button 
            onClick={onBtnLabel}
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
        <div className="flex flex-col mt-5 mb-8">
          {/* 아이콘 (32x32, 중앙정렬) */}
          {icon && (
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
          
          {/* content */}
          <div className="text-center h5-b text-primary mb-2">
            {content}
          </div>
          
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
            variant="brand1" 
            size="lg" 
            textSize="lg"
            className="flex-1"
            onClick={onBtnLabel}
            disabled={isLoading}
          >
            {btnLabel}
          </Button>
          {/* 서브 버튼 */}
          {subBtnLabel && (
            <Button 
            variant="secondary" 
            size="lg" 
            textSize="lg"
            className="flex-1"
            onClick={onSubBtnLabel}
            disabled={isLoading}
          >
            {subBtnLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
