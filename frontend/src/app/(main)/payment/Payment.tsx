'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AlertDialog from '@/components/ui/alert-dialog';
import SuccessCheckIcon from '@/component/icon/success_check_icon';
import { validateAndFormatExpiryDate, validateAllPaymentFields } from '@/utils/validation';
import { formatTime, formatKoreanDate } from '@/utils/dateUtils';
import { createPayment, holdSeats } from '@/api/payment';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notificationStore';

interface PaymentProps {
  fundingId?: number;
  userId?: string;
  amount?: number;
  title?: string;
  videoName?: string;
  screenDate?: string;
  screenStartsOn?: number;
  screenEndsOn?: number;
  cinemaName?: string;
  screenName?: string;
  screenFeatures?: {
    isDolby?: boolean;
    isImax?: boolean;
    isScreenx?: boolean;
    is4dx?: boolean;
    isRecliner?: boolean;
  };
  onClose?: () => void; // Dialog를 닫기 위한 콜백 함수
}

export default function Payment({ fundingId, userId, amount, title, videoName, screenDate, screenStartsOn, screenEndsOn, cinemaName, screenName, screenFeatures, onClose }: PaymentProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { notifications } = useNotificationStore();
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [isLoading, setIsLoading] = useState(false);
  const [showFailureModal, setShowFailureModal] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');

  // 결제 정보 입력 상태 관리
  const [paymentData, setPaymentData] = useState({
    cardNumber1: '',
    cardNumber2: '',
    cardNumber3: '',
    cardNumber4: '',
    expiryDate: '',
    cvc: '',
    password: '',
    birthDate: '',
    termsAgreed: false,
  });

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const result = validateAndFormatExpiryDate(e.target.value);
    if (result.formattedValue) {
      setPaymentData({ ...paymentData, expiryDate: result.formattedValue });
    }
  };

  const handleExpiryDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (e.key === 'Backspace' && value.endsWith('/')) {
      e.preventDefault();
      const newValue = value.substring(0, value.length - 2); // / 와 그 앞의 숫자 하나 제거
      setPaymentData({ ...paymentData, expiryDate: newValue });
    }
  };

  const isAllFieldsCompleted = () => {
    return validateAllPaymentFields(paymentData).isValid;
  };

  const handleNextToStep2 = () => {
    setCurrentStep('step2');
  };

  const handleNextToStep3 = async () => {
    if (!isAllFieldsCompleted()) return;


    setIsLoading(true);
    try {
      const fullCardNumber = `${paymentData.cardNumber1}${paymentData.cardNumber2}${paymentData.cardNumber3}${paymentData.cardNumber4}`;

      const paymentParams = {
        userId: user?.userId || 0,
        fundingId: fundingId || 0,
        cardNumber: fullCardNumber,
        cardCvc: paymentData.cvc,
        amount: amount || 0,
      };


      if (!fundingId || !userId) {
        throw new Error('fundingId 또는 userId가 없습니다.');
      }

      await holdSeats(fundingId, parseInt(userId));


      await createPayment(paymentParams);

      // 결제 성공 시 step3로 이동
      setCurrentStep('step3');
    } catch (error) {
      console.error('=== Payment/HoldSeats API 요청 실패 ===');
      console.error('에러:', error);

      let errorMessage = '결제 처리 중 오류가 발생했습니다.';
      if (error instanceof Error) {
        if (error.message.includes('hold')) {
          errorMessage = '자리 확보에 실패했습니다. 다시 시도해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      setPaymentError(errorMessage);
      setShowFailureModal(true);
    } finally {
      setIsLoading(false);
    }
  };


  const handleBackToStep1 = () => {
    setCurrentStep('step1');
    setPaymentData({
      cardNumber1: '',
      cardNumber2: '',
      cardNumber3: '',
      cardNumber4: '',
      expiryDate: '',
      cvc: '',
      password: '',
      birthDate: '',
      termsAgreed: false,
    });
  };


  const handleRetry = () => {
    setShowFailureModal(false);
    setPaymentError('');
  };

  const handleSuccess = () => {
    resetAllStates();
    onClose?.(); // 부모 Dialog 닫기
    
    // 결제 성공 후 React Query 캐시 무효화하여 UI 업데이트
    queryClient.invalidateQueries({
      queryKey: ['DETAIL', fundingId?.toString(), userId]
    });
    
    // 알림 상태 확인 및 로깅
    // console.log('💳 결제 성공! 현재 알림 개수:', notifications.length);
    // console.log('💳 알림 목록:', notifications);
    
    // 5초 후 알림 상태 재확인 (백엔드 처리 시간 고려)
    setTimeout(() => {
      const updatedNotifications = useNotificationStore.getState().notifications;
      console.log('💳 5초 후 알림 개수:', updatedNotifications.length);
      console.log('💳 5초 후 알림 목록:', updatedNotifications);
      
      if (updatedNotifications.length > notifications.length) {
        console.log('🎉 새로운 알림이 추가되었습니다!');
      } else {
        console.log('⚠️ 아직 새로운 알림이 추가되지 않았습니다. SSE 연결을 확인해주세요.');
      }
    }, 5000);
    
    router.push(`/detail/${fundingId}`); // 새로고침 없이 페이지 이동
  };

  const resetAllStates = () => {
    setCurrentStep('step1');
    setIsLoading(false);
    setShowFailureModal(false);
    setPaymentError('');
    setPaymentData({
      cardNumber1: '',
      cardNumber2: '',
      cardNumber3: '',
      cardNumber4: '',
      expiryDate: '',
      cvc: '',
      password: '',
      birthDate: '',
      termsAgreed: false,
    });
  };


  const renderContent = () => {
    if (currentStep === 'step1') {
      return (
        <>
          <DialogHeader className="self-stretch" onClose={resetAllStates}>
            <DialogTitle>결제 내역</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">펀딩 결제를 위한 내역을 확인하는 단계입니다.</DialogDescription>
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col">
              <div className="h5-b text-primary leading-7">펀딩 제목</div>
              <div className="p1 text-secondary leading-normal">{title || '펀딩 제목'}</div>
            </div>

            <div className="w-full bg-BG-2 py-4 rounded-[12px] text-center flex-col items-start">
              <div className="h5-b text-primary mb-2">{videoName || '영화 제목'}</div>
              <div className="p1 text-primary">
                {cinemaName || '영화관'} {screenName || '상영관'}
                {screenFeatures?.isDolby ? ' | Dolby Atmos' : ''}
                {screenFeatures?.isImax ? ' | IMAX' : ''}
                {screenFeatures?.isScreenx ? ' | ScreenX' : ''}
                {screenFeatures?.is4dx ? ' | 4DX' : ''}
                {screenFeatures?.isRecliner ? ' | 리클라이너' : ''}
              </div>
              <div className="p2 text-tertiary">
                {screenDate ? formatKoreanDate(screenDate) : '상영일'}
                {screenStartsOn && screenEndsOn ? ` ${formatTime(screenStartsOn)} ~ ${formatTime(screenEndsOn)}` : ' 시간'}
              </div>
            </div>

            <div className="w-full flex justify-between items-center">
              <div className="h5-b text-primary">결제 금액</div>
              <div className="h4-b text-primary">{amount ? amount.toLocaleString() : '0'}원</div>
            </div>
          </div>
          <Button variant="brand1" size="lg" textSize="lg" className="w-full" onClick={handleNextToStep2}>
            결제하러 가기
          </Button>
        </>
      );
    }

    if (currentStep === 'step2') {
      if (isLoading) {
        return (
          <>
            <DialogHeader className="self-stretch" onClose={resetAllStates}>
              <DialogTitle>결제 처리 중</DialogTitle>
            </DialogHeader>
            <DialogDescription className="sr-only">결제 처리가 진행 중입니다. 잠시만 기다려주세요.</DialogDescription>
            <div className="w-full flex flex-col items-center gap-4 py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-subtle border-t-transparent"></div>
              <div className="text-center mt-4">
                <div className="h5-b text-primary">결제 처리중입니다</div>
                <div className="p2 text-tertiary">잠시만 기다려주세요</div>
              </div>
            </div>
          </>
        );
      }

      return (
        <>
          <DialogHeader className="self-stretch" onClose={resetAllStates}>
            <DialogTitle>결제 정보 입력</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">카드 정보와 개인 정보를 입력하는 단계입니다.</DialogDescription>
          <div className="flex flex-col gap-2">
            <label className="h5-b text-primary">
              카드번호 <span className="text-Brand1-Primary">*</span>
            </label>
            <div className="flex gap-1">
              <Input placeholder="앞 4자리" maxLength={4} className="bg-BG-2" value={paymentData.cardNumber1} onChange={(e) => setPaymentData({ ...paymentData, cardNumber1: e.target.value })} />
              <Input
                type="password"
                placeholder="****"
                maxLength={4}
                className="bg-BG-2"
                value={paymentData.cardNumber2}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber2: e.target.value })}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => !e.target.value && (e.target.placeholder = '****')}
              />
              <Input
                type="password"
                placeholder="****"
                maxLength={4}
                className="bg-BG-2"
                value={paymentData.cardNumber3}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber3: e.target.value })}
                onFocus={(e) => (e.target.placeholder = '')}
                onBlur={(e) => !e.target.value && (e.target.placeholder = '****')}
              />
              <Input placeholder="뒤 4자리" maxLength={4} className="bg-BG-2" value={paymentData.cardNumber4} onChange={(e) => setPaymentData({ ...paymentData, cardNumber4: e.target.value })} />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <label className="h5-b text-primary">
                유효기간<span className="text-Brand1-Primary ml-1">*</span>
              </label>
              <Input placeholder="MM/YY" maxLength={5} className="bg-BG-2" value={paymentData.expiryDate} onChange={handleExpiryDateChange} onKeyDown={handleExpiryDateKeyDown} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="h5-b text-primary">
                CVC<span className="text-Brand1-Primary ml-1">*</span>
              </label>
              <Input type="password" maxLength={3} placeholder="***" className="bg-BG-2" value={paymentData.cvc} onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <label className="h5-b text-primary">비밀번호</label>
              <Input
                type="password"
                placeholder="앞 2자리"
                maxLength={2}
                className="bg-BG-2"
                value={paymentData.password}
                onChange={(e) => setPaymentData({ ...paymentData, password: e.target.value })}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="h5-b text-primary">생년월일</label>
              <Input maxLength={6} placeholder="주민번호 앞 6자리" className="bg-BG-2" value={paymentData.birthDate} onChange={(e) => setPaymentData({ ...paymentData, birthDate: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Input type="checkbox" id="terms-agreement" className="w-4 h-4" checked={paymentData.termsAgreed} onChange={(e) => setPaymentData({ ...paymentData, termsAgreed: e.target.checked })} />
            <label htmlFor="terms-agreement" className="p1 text-primary">
              [필수] 결제 서비스 이용 약관, 개인정보 처리 동의
            </label>
          </div>

          <div className="self-stretch flex gap-3">
            <Button variant="tertiary" size="lg" className="flex-1 border-slate-600 text-white hover:bg-slate-700" onClick={handleBackToStep1}>
              이전
            </Button>
            <Button variant={isAllFieldsCompleted() ? 'brand1' : 'tertiary'} size="lg" className="flex-1" onClick={handleNextToStep3} disabled={!isAllFieldsCompleted()}>
              결제하기
            </Button>
          </div>
        </>
      );
    }

    // step3: AlertDialog로 결제 완료 화면
    if (currentStep === 'step3') {
      return null; // DialogContent 대신 AlertDialog 사용
    }

  };

  return (
    <>
      {/* step1, step2만 DialogContent로 표시 */}
      {currentStep !== 'step3' && (
        <DialogContent onPointerDownOutside={resetAllStates} onEscapeKeyDown={resetAllStates}>
          {renderContent()}
        </DialogContent>
      )}

      {/* step3: 성공 모달 (AlertDialog) */}
      {currentStep === 'step3' && (
        <AlertDialog
          title="결제 완료"
          content="결제가 완료되었습니다!"
          info="결제 정보는 마이페이지 > 결제내역에서 확인하실 수 있습니다."
          icon={<SuccessCheckIcon width={72} height={72} />}
          btnLabel="확인"
          // subBtnLabel=""
          onBtnLabel={handleSuccess}
          // onSubBtnLabel={() => {}}
        />
      )}

      {/* 실패 모달 */}
      {showFailureModal && (
        <DialogContent onPointerDownOutside={handleRetry} onEscapeKeyDown={handleRetry}>
          <DialogHeader>
            <DialogTitle>결제 실패</DialogTitle>
          </DialogHeader>
          <DialogDescription className="sr-only">결제 처리 중 오류가 발생했습니다.</DialogDescription>
          <div className="w-full flex flex-col items-center gap-4 py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="text-center">
              <div className="h5-b text-primary mb-2">결제에 실패했습니다</div>
              <div className="p2 text-tertiary">{paymentError}</div>
            </div>
            <div className="w-full flex gap-3">
              <Button variant="tertiary" size="lg" className="flex-1" onClick={handleRetry}>
                다시 시도
              </Button>
              <Button variant="brand1" size="lg" className="flex-1" onClick={resetAllStates}>
                닫기
              </Button>
            </div>
          </div>
        </DialogContent>
      )}
    </>
  );
}
