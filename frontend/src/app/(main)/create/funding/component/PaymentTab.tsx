'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import InformationIcon from '@/component/icon/infomrationIcon';
import { Button } from '@/components/ui/button';
import { CreatePaymentParams } from '@/types/payment';
import { useAuthStore } from '@/stores/authStore';
import { createPayment } from '@/api/payment';
import { useRouter } from 'next/navigation';

interface PaymentTabProps {
  onNext: (data: CreatePaymentParams) => void;
  onPrev?: () => void;
  fundingId?: number | null; // 생성된 펀딩 ID
  amount?: number | null; // 1인당 결제 금액
}

export default function PaymentTab({ onNext, onPrev, fundingId, amount }: PaymentTabProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentData, setPaymentData] = useState({
    cardNumber1: '',
    cardNumber2: '',
    cardNumber3: '',
    cardNumber4: '',
    expiryDate: '',
    cvc: '',
    password: '',
    birthDate: '',
  });

  // 유효기간 입력 처리
  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // 숫자만 허용
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    setPaymentData({ ...paymentData, expiryDate: value });
  };

  // 백스페이스 키 처리
  const handleExpiryDateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const value = target.value;

    if (e.key === 'Backspace' && value.endsWith('/')) {
      e.preventDefault();
      const newValue = value.substring(0, value.length - 2);
      setPaymentData({ ...paymentData, expiryDate: newValue });
    }
  };

  // 다음 단계로 넘어가는 핸들러
  const handleNext = async () => {
    console.log('=== PaymentTab 제출 시작 ===');
    console.log('현재 paymentData:', paymentData);
    console.log('fundingId:', fundingId);
    console.log('============================');

    // 결제 데이터 유효성 검사
    const hasRequiredData = paymentData.cardNumber1 && paymentData.cardNumber2 && paymentData.cardNumber3 && paymentData.cardNumber4 && paymentData.expiryDate && paymentData.cvc;
    console.log('필수 데이터 입력 여부:', hasRequiredData);

    if (!hasRequiredData) {
      alert('필수 결제 정보를 입력해주세요.');
      return;
    }
    setIsSubmitting(true);
    try {
      // 카드 번호 합치기
      const fullCardNumber = `${paymentData.cardNumber1}${paymentData.cardNumber2}${paymentData.cardNumber3}${paymentData.cardNumber4}`;

      const paymentParams: CreatePaymentParams = {
        userId: user?.userId || 0,
        fundingId: fundingId || 0,
        cardNumber: fullCardNumber,
        cardCvc: paymentData.cvc,
        amount: amount || 0, // 1인당 결제 금액
      };

      console.log('=== Payment API 요청 시작 ===');
      console.log('요청 데이터:', paymentParams);

      const result = await createPayment(paymentParams);

      console.log('=== Payment API 요청 성공 ===');
      console.log('응답:', result);
      alert('결제가 성공적으로 완료되었습니다!');
      router.push('/mypage');
    } catch (error) {
      console.error('=== Payment API 요청 실패 ===');
      console.error('에러:', error);
      alert('결제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-8">
        <div className="w-full flex gap-4">
          {/* 카드 번호  */}
          <div className="flex-1 space-y-2">
            <Label className="h5-b text-primary">
              카드 번호 <span className="text-Brand1-Primary">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="1234"
                maxLength={4}
                className="bg-BG-2 text-center"
                value={paymentData.cardNumber1}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber1: e.target.value })}
              />
              <Input
                type="password"
                placeholder="5678"
                maxLength={4}
                className="bg-BG-2 text-center"
                value={paymentData.cardNumber2}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber2: e.target.value })}
              />
              <Input
                type="password"
                placeholder="9123"
                maxLength={4}
                className="bg-BG-2 text-center"
                value={paymentData.cardNumber3}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber3: e.target.value })}
              />
              <Input
                placeholder="4567"
                maxLength={4}
                className="bg-BG-2 text-center"
                value={paymentData.cardNumber4}
                onChange={(e) => setPaymentData({ ...paymentData, cardNumber4: e.target.value })}
              />
            </div>
          </div>

          {/* 유효기간과 CVC*/}
          <div className="flex-1 flex gap-4">
            {/* 유효기간*/}
            <div className="flex-1 space-y-2">
              <Label className="h5-b text-primary">
                유효 기간 (MM/YY) <span className="text-Brand1-Primary">*</span>
              </Label>
              <Input placeholder="MM/YY" maxLength={5} className="bg-BG-2" value={paymentData.expiryDate} onChange={handleExpiryDateChange} onKeyDown={handleExpiryDateKeyDown} />
            </div>
            {/* CVC*/}
            <div className="flex-1 space-y-2">
              <Label className="h5-b text-primary">
                CVC <span className="text-Brand1-Primary">*</span>
              </Label>
              <Input type="password" placeholder="3자리" maxLength={3} className="bg-BG-2" value={paymentData.cvc} onChange={(e) => setPaymentData({ ...paymentData, cvc: e.target.value })} />
            </div>
          </div>
        </div>

        {/* 비밀번호와 생년월일 */}
        <div className="flex justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Label className="h5-b text-primary">
              비밀번호 <span className="text-Brand1-Primary">*</span>
            </Label>
            <Input
              type="password"
              placeholder="앞 2자리"
              maxLength={2}
              className="bg-BG-2"
              value={paymentData.password}
              onChange={(e) => setPaymentData({ ...paymentData, password: e.target.value })}
            />
          </div>
          <div className="flex-1 space-y-2">
            <Label className="h5-b text-primary">
              생년월일(YYMMDD) <span className="text-Brand1-Primary">*</span>
            </Label>
            <Input placeholder="주민번호 앞 6자리" maxLength={6} className="bg-BG-2" value={paymentData.birthDate} onChange={(e) => setPaymentData({ ...paymentData, birthDate: e.target.value })} />
          </div>
        </div>
      </div>
      <Separator />

      {/* 안내 메시지 */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <InformationIcon />
          <p className="p2-b text-tertiary">프로젝트 만들기 버튼을 클릭하면 입력한 결제 정보에 따라 주최자의 티켓값이 결제됩니다.</p>
        </div>
        <div className="flex items-center gap-2">
          <InformationIcon />
          <p className="p2-b text-tertiary">펀딩은 승인 후 즉시 개설되며, 대관 신청일 7일 전까지 활성화됩니다.</p>
        </div>
      </div>
      <div>
        {/* 이전 다음 바튼 */}
        <div className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Button variant="tertiary" size="lg" className="w-full" onClick={onPrev}>
            이전
          </Button>
          <Button type="button" variant="brand1" size="lg" className="w-full" onClick={handleNext} disabled={isSubmitting}>
            {isSubmitting ? '처리 중...' : '결제 하기'}
          </Button>
        </div>
      </div>
    </div>
  );
}
