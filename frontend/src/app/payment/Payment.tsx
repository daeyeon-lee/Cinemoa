'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import SuccessCheckIcon from '@/component/icon/success_check_icon';

export default function Payment() {
  const [currentStep, setCurrentStep] = useState<'step1' | 'step2' | 'step3'>('step1');
  const [isLoading, setIsLoading] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);

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

  // 유효기간 입력 포맷팅 함수
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // 숫자만 추출
    let numbersOnly = value.replace(/\D/g, '');

    // 최대 4자리까지만 허용
    if (numbersOnly.length > 4) {
      numbersOnly = numbersOnly.substring(0, 4);
    }

    // 포맷팅 적용
    if (numbersOnly.length >= 3) {
      value = numbersOnly.substring(0, 2) + '/' + numbersOnly.substring(2);
    } else {
      value = numbersOnly;
    }

    setPaymentData({ ...paymentData, expiryDate: value });
  };

  // 백스페이스 키 처리
  const handleExpiryDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (e.key === 'Backspace' && value.endsWith('/')) {
      e.preventDefault();
      const newValue = value.substring(0, value.length - 2); // / 와 그 앞의 숫자 하나 제거
      setPaymentData({ ...paymentData, expiryDate: newValue });
    }
  };

  // 모든 필드가 입력되었는지 확인
  const isAllFieldsCompleted = () => {
    return (
      paymentData.cardNumber1.length === 4 &&
      paymentData.cardNumber2.length === 4 &&
      paymentData.cardNumber3.length === 4 &&
      paymentData.cardNumber4.length === 4 &&
      paymentData.expiryDate.length === 5 && // MM/YY 형식 (5자리)
      paymentData.cvc.length === 3 &&
      paymentData.password.length === 2 &&
      paymentData.birthDate.length === 6 &&
      paymentData.termsAgreed
    );
  };

  // 다음으로 이동
  const handleNextToStep2 = () => {
    setCurrentStep('step2');
  };

  // step3 이동
  const handleNextToStep3 = () => {
    if (!isAllFieldsCompleted()) return;
    setCurrentStep('step3');
  };

  // step3에서 결제 처리
  const processPayment = async () => {
    setIsLoading(true);
    setPaymentCompleted(false);

    try {
      // 결제 API 호출 시뮬레이션
      await new Promise((resolve) => setTimeout(resolve, 2000)); // 2초 로딩

      // API 호출 성공 후 결제 완료 상태로 변경
      setPaymentCompleted(true);
    } catch (error) {
      console.error('결제 처리 중 오류 발생:', error);
      // 에러 처리 로직 추가 가능
    } finally {
      setIsLoading(false);
    }
  };

  // 이전으로 이동
  const handleBackToStep1 = () => {
    setCurrentStep('step1');
  };

  const handleBackToStep2 = () => {
    setCurrentStep('step2');
  };

  // 최종 제출
  const handleConfirmComplete = () => {
    setCurrentStep('step1');
  };

  // step3에 진입하면 자동으로 결제 처리 시작
  useEffect(() => {
    if (currentStep === 'step3' && !paymentCompleted && !isLoading) {
      processPayment();
    }
  }, [currentStep]);

  const renderContent = () => {
    // 1단계 : 결제 내역 확인 단계
    if (currentStep === 'step1') {
      return (
        <>
          <DialogHeader className="self-stretch">
            <DialogTitle>결제 내역</DialogTitle>
            <DialogDescription className="sr-only">펀딩 결제 내역을 확인하고 결제를 진행합니다</DialogDescription>
          </DialogHeader>
          <div className="w-full flex flex-col gap-6">
            <div className="flex flex-col">
              <div className="h5-b text-primary leading-7">펀딩 제목</div>
              <div className="p1 text-secondary leading-normal">케데헌 같이 보실 분 영등포로 보여라~</div>
            </div>

            <div className="w-full bg-BG-2 py-4 rounded-[12px] text-center flex-col items-start">
              <div className="h5-b text-primary mb-2">케이팝 데몬 헌터스</div>
              <div className="p1 text-primary">CGV 강남 2관 Dolby Atmos</div>
              <div className="p2 text-tertiary">2025.10.19 (일) 14:00 ~ 18:00</div>
            </div>

            <div className="w-full flex justify-between items-center">
              <div className="h5-b text-primary">결제 금액</div>
              <div className="h4-b text-primary">20,000원</div>
            </div>
          </div>
          <Button variant="brand1" size="lg" className="w-full" onClick={handleNextToStep2}>
            결제하러 가기
          </Button>
        </>
      );
    }

    // 2단계 : 결제 정보 입력 단계
    if (currentStep === 'step2') {
      return (
        <>
          <DialogHeader className="self-stretch">
            <DialogTitle>결제 정보 입력</DialogTitle>
            <DialogDescription className="sr-only">
              카드 정보와 개인 정보를 입력하여 결제를 완료합니다
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <label className="h5-b text-primary">
              카드번호 <span className="text-Brand1-Primary">*</span>
            </label>
            <div className="flex gap-1">
              <Input
                placeholder="앞 4자리"
                maxLength={4}
                className="bg-BG-2"
                value={paymentData.cardNumber1}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber1: e.target.value })}
              />
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
              <Input
                placeholder="뒤 4자리"
                maxLength={4}
                className="bg-BG-2"
                value={paymentData.cardNumber4}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber4: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-2">
              <label className="h5-b text-primary">
                유효기간<span className="text-Brand1-Primary ml-1">*</span>
              </label>
              <Input
                placeholder="MM/YY"
                maxLength={5}
                className="bg-BG-2"
                value={paymentData.expiryDate}
                onChange={handleExpiryDateChange}
                onKeyDown={handleExpiryDateKeyDown}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="h5-b text-primary">
                CVC<span className="text-Brand1-Primary ml-1">*</span>
              </label>
              <Input
                type="password"
                maxLength={3}
                placeholder="***"
                className="bg-BG-2"
                value={paymentData.cvc}
                onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })}
              />
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
              <Input
                maxLength={6}
                placeholder="주민번호 앞 6자리"
                className="bg-BG-2"
                value={paymentData.birthDate}
                onChange={(e) => setPaymentData({ ...paymentData, birthDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="checkbox"
              id="terms-agreement"
              className="w-4 h-4"
              checked={paymentData.termsAgreed}
              onChange={(e) => setPaymentData({ ...paymentData, termsAgreed: e.target.checked })}
            />
            <DialogDescription className="mb-0">[필수] 결제 서비스 이용 약관, 개인정보 처리 동의</DialogDescription>
          </div>

          <div className="self-stretch flex gap-3">
            <Button
              variant="tertiary"
              size="lg"
              className="flex-1 border-slate-600 text-white hover:bg-slate-700"
              onClick={handleBackToStep1}
            >
              이전
            </Button>
            <Button
              variant={isAllFieldsCompleted() ? 'brand1' : 'tertiary'}
              size="lg"
              className="flex-1"
              onClick={handleNextToStep3}
              disabled={!isAllFieldsCompleted()}
            >
              다음
            </Button>
          </div>
        </>
      );
    }

    // 3단계 : 결제 처리 및 완료 단계
    if (currentStep === 'step3') {
      if (isLoading) {
        // 로딩 중 상태
        return (
          <>
            <DialogDescription className="sr-only">결제 처리중입니다.</DialogDescription>
            <div className="w-full flex flex-col items-center gap-4 py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-subtle border-t-transparent"></div>
              <div className="text-center">
                <div className="h5-b text-primary">결제 처리중입니다</div>
                <div className="p2 text-tertiary">잠시만 기다려주세요</div>
              </div>
            </div>
          </>
        );
      } else if (paymentCompleted) {
        // 결제 완료 상태
        return (
          <>
            <DialogDescription className="sr-only">결제가 성공적으로 완료되었습니다</DialogDescription>
            <div className="w-full flex flex-col items-center">
              <SuccessCheckIcon width={72} height={72} />

              <div className="text-center flex flex-col">
                <div>
                  <div className="h5-b text-primary mb-2">결제가 완료되었습니다!</div>
                  <div className="p2 text-tertiary">결제 정보는 마이페이지 &gt; 결제내역에서 확인하실 수 있습니다.</div>
                </div>
              </div>
            </div>

            <div className="w-full flex gap-4">
              <Button variant="secondary" size="lg" className="w-full" onClick={handleBackToStep2}>
                이전
              </Button>
              <Button variant="brand1" size="lg" className="w-full" onClick={handleConfirmComplete}>
                확인
              </Button>
            </div>
          </>
        );
      }
    }
  };

  return (
    <DialogContent className="p-10 bg-slate-800 border-slate-700 max-w-md duration-0 data-[state=open]:animate-none data-[state=closed]:animate-none">
      {renderContent()}
    </DialogContent>
  );
}
