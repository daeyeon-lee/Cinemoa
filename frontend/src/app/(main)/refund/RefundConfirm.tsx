'use client';

import { useState } from 'react';
import ConfirmDialog from '@/components/ui/confirm-dialog';
import { useFundingRefund } from '@/hooks/queries/useFunding';
import InfoIcon from '@/component/icon/infoIcon';
import { useNotificationStore } from '@/stores/notificationStore';

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
  const { notifications } = useNotificationStore();

  // 환불 진행
  const handleRefund = async () => {
    if (!fundingId || !userId) {
      alert('필수 정보가 없습니다.');
      return;
    }

    setIsLoading(true);

    // 현재 알림 개수
    const initialNotificationCount = useNotificationStore.getState().notifications.length;
    
    try {
      refundMutation.mutate({
        fundingId,
        userId,
      }, {
        onSuccess: () => {
          setIsLoading(false);
          onSuccess?.(); // 환불 성공 시 완료 모달 표시
          
          // 환불 성공 후 알림 상태 확인 및 로깅
          // console.log('💸 환불 성공! 현재 알림 개수:', notifications.length);
          // console.log('💸 알림 목록:', notifications);
          
          // 7초 후 알림 상태 재확인 (백엔드 처리 시간 고려)
          setTimeout(() => {
            const updatedNotifications = useNotificationStore.getState().notifications;
            console.log('💸 7초 후 알림 개수:', updatedNotifications.length);
            console.log('💸 7초 후 알림 목록:', updatedNotifications);
            
            if (updatedNotifications.length > initialNotificationCount) {
              console.log('🎉 새로운 알림이 추가되었습니다!');
            } else {
              console.log('⚠️ 아직 새로운 알림이 추가되지 않았습니다. SSE 연결을 확인해주세요.');
            }
          }, 7000);
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
