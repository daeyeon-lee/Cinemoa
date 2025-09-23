import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import ShareIcon from '@/component/icon/shareIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

type ShareButtonProps = {
  /** 공유 버튼의 색상을 결정하는 플래그 (예: 좋아요 상태에 따라) */
  isActive?: boolean;
  /** 버튼의 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 버튼의 variant */
  variant?: 'outline' | 'ghost' | 'secondary';
  /** 추가적인 CSS 클래스 */
  className?: string;
};

/**
 * 링크 공유 기능을 제공하는 재사용 가능한 컴포넌트
 * - 공유 버튼 클릭 시 모달이 열림
 * - 현재 페이지 링크를 복사할 수 있음
 * - 복사 완료 시 알림 표시
 */
const ShareButton: React.FC<ShareButtonProps> = ({
  isActive = false,
  size = 'lg',
  variant = 'outline',
  className = '',
}) => {
  // 공유 다이얼로그 열림 상태
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  
  // 알림 메시지 상태
  const [alertMessage, setAlertMessage] = useState('');

  // 현재 페이지 링크 복사 함수
  const handleCopyLink = async () => {
    try {
      const href = typeof window !== 'undefined' ? window.location.href : '';
      await navigator.clipboard.writeText(href);
      setAlertMessage('링크가 복사되었습니다.');
      setTimeout(() => setAlertMessage(''), 1500); // 1.5초 후 알림 닫기
    } catch {
      setAlertMessage('복사에 실패했습니다. 다시 시도해주세요.');
      setTimeout(() => setAlertMessage(''), 1500);
    }
  };

  return (
    <>
      {/* 공유 버튼 */}
      <Button 
        variant={variant} 
        size={size} 
        textSize="lg" 
        className={className}
        onClick={() => setShareDialogOpen(true)}
      >
        <ShareIcon stroke="#94A3B8" />
      </Button>

      {/* 공유 다이얼로그 */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent variant="share" className="space-y-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-center">링크 공유</DialogTitle>
            <DialogDescription className="text-center text-tertiary">
              현재 페이지의 링크를 복사하여 공유할 수 있습니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="h5 text-secondary">현재 페이지 링크</label>
              <div className="flex gap-2 items-center">
                <Input
                  className="flex-1 h-10 p2 text-secondary bg-BG-1 border-stroke-3 focus:border-primary-500 transition-colors"
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  type="text"
                  readOnly
                />
                <Button
                  variant="primary"
                  size="md"
                  className="h-10 px-4 whitespace-nowrap"
                  onClick={handleCopyLink}
                >
                  복사
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 중앙 띄우는 커스텀 알림 (토스트 대용) */}
      {alertMessage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center animate-in fade-in duration-200">
          {/* 어두운 배경 오버레이 */}
          <div className="absolute inset-0 bg-black/80" />
          {/* 알림창 컨텐츠 */}
          <div className="relative bg-BG-2 text-primary px-8 py-6 rounded-2xl shadow-2xl max-w-md w-max text-center animate-in zoom-in-95 duration-200">
            <p className="h6-b">{alertMessage}</p>
          </div>
        </div>
      )}
    </>
  );
};

export { ShareButton };
export type { ShareButtonProps };
