'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useFundingRefund } from '@/hooks/queries/useFunding';
import InfoIcon from '@/component/icon/infoIcon';

interface RefundConfirmProps {
  fundingId?: number;
  userId?: string;
  amount?: number;
  title?: string;
  onClose?: () => void;
  onSuccess?: () => void;
}

export default function RefundConfirm({ 
  fundingId, 
  userId,
  amount,
  title,
  onClose,
  onSuccess
}: RefundConfirmProps) {
  const [isLoading, setIsLoading] = useState(false);
  const refundMutation = useFundingRefund({ skipRedirect: true });

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
      }, {
        onSuccess: () => {
          setIsLoading(false);
          onSuccess?.(); // 환불 성공 시 완료 모달 표시
        },
        onError: (error) => {
          console.error('환불 처리 중 오류:', error);
          alert('환불 처리 중 오류가 발생했습니다.');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('환불 처리 중 오류:', error);
      alert('환불 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
    }
  };

  // 환불 정보 텍스트 생성
  const contentText = `펀딩명 : ${title}
    환불 금액 : ${amount?.toLocaleString()}원`;

  // 환불 정보 주의사항 생성
  const infoText =
  ` • 참여를 취소하시면 참여금이 환불됩니다.
    • 환불 처리는 즉시 진행되며, 취소할 수 없습니다.`;

  return (
    <ConfirmDialog
      title="참여 취소"
      subTitle="정말로 참여를 취소하시겠습니까?"
      content={contentText}
      info={infoText}
      icon={<InfoIcon stroke="#FF5768" size={52} />}
      negLabel="아니오"
      posLabel="참여 취소하기"
      onNegative={() => onClose?.()}
      onPositive={handleRefund}
      isLoading={isLoading}
    />
  );
}
