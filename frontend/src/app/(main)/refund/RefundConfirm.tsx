'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useFundingRefund } from '@/hooks/queries/useFunding';

interface RefundConfirmProps {
  fundingId?: number;
  userId?: string;
  amount?: number;
  title?: string;
  onClose?: () => void; // Dialog를 닫기 위한 콜백 함수
}

export default function RefundConfirm({ 
  fundingId, 
  userId,
  amount,
  title,
  onClose 
}: RefundConfirmProps) {
  const [isLoading, setIsLoading] = useState(false);
  const refundMutation = useFundingRefund();

  // 환불 진행
  const handleRefund = async () => {
    if (!fundingId || !userId) {
      alert('필수 정보가 없습니다.');
      return;
    }

    setIsLoading(true);
    
    try {
      refundMutation.mutate({
        fundingId,
        userId,
      });
    } catch (error) {
      console.error('환불 처리 중 오류:', error);
      alert('환불 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 취소
  const handleCancel = () => {
    onClose?.();
  };

  return (
    <DialogContent className="max-w-md">
      <DialogHeader className="space-y-3">
        <DialogTitle className="text-center text-xl">참여 취소</DialogTitle>
        <DialogDescription className="text-center text-secondary">
          정말로 참여를 취소하시겠습니까?
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 pt-4">
        {/* 환불 정보 */}
        <div className="bg-BG-1 rounded-lg p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-tertiary">펀딩명</span>
            <span className="text-primary font-medium">{title}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-tertiary">환불 금액</span>
            <span className="text-primary font-medium">{amount?.toLocaleString()}원</span>
          </div>
        </div>

        {/* 주의사항 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">
            • 참여를 취소하시면 참여금이 환불됩니다.<br/>
            • 환불 처리는 즉시 진행되며, 취소할 수 없습니다.
          </p>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          <Button 
            variant="secondary" 
            size="lg" 
            className="flex-1"
            onClick={handleCancel}
            disabled={isLoading}
          >
            아니오
          </Button>
          <Button 
            variant="brand1" 
            size="lg" 
            className="flex-1"
            onClick={handleRefund}
            disabled={isLoading}
          >
            {isLoading ? '처리 중...' : '예, 환불하기'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}
