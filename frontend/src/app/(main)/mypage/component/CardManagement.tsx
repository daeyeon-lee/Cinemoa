import React, { useState, useEffect } from 'react';
import { useCardStore } from '@/stores/cardStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

// 컴포넌트가 받을 props의 타입을 정의합니다.
interface CardManagementProps {
  isOpen: boolean;
  onClose: () => void; // 아무 인자도 받지 않고 아무것도 반환하지 않는 함수 타입
}

// 카드 정보 state의 타입을 정의합니다.
interface CardInfoState {
  num1: string;
  num2: string;
  num3: string;
  num4: string;
  expiry: string;
  cvc: string;
  password: string;
  birth: string;
}

// React.FC (Functional Component)를 사용하여 컴포넌트 타입을 지정합니다.
const CardManagement: React.FC<CardManagementProps> = ({ isOpen, onClose }) => {
  const { addCard, cards } = useCardStore();

  // useState에 제네릭(<>)으로 state의 타입을 명시합니다.
  const [cardInfo, setCardInfo] = useState<CardInfoState>({
    num1: '',
    num2: '',
    num3: '',
    num4: '',
    expiry: '',
    cvc: '',
    password: '',
    birth: '',
  });

  // 모달이 열릴 때 store에 저장된 카드 정보가 있다면 폼에 채우기
  useEffect(() => {
    if (isOpen && cards.length > 0) {
      const latestCard = cards[cards.length - 1]; // 가장 최근에 추가된 카드
      setCardInfo({
        num1: latestCard.cardNumber[0] || '',
        num2: latestCard.cardNumber[1] || '',
        num3: latestCard.cardNumber[2] || '',
        num4: latestCard.cardNumber[3] || '',
        expiry: latestCard.expiryDate || '',
        cvc: latestCard.cvc || '',
        password: latestCard.password || '',
        birth: latestCard.birthDate || '',
      });
    } else if (isOpen && cards.length === 0) {
      // 카드가 없으면 폼 초기화
      setCardInfo({
        num1: '',
        num2: '',
        num3: '',
        num4: '',
        expiry: '',
        cvc: '',
        password: '',
        birth: '',
      });
    }
  }, [isOpen, cards]);

  // Hook 호출 이후에 조건부 렌더링 로직 실행
  if (!isOpen) {
    return null;
  }

  // 이벤트 객체(e)의 타입을 명시합니다. (input 요소의 변경 이벤트)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // 숫자만 입력 허용
    const numericValue = value.replace(/\D/g, '');
    
    // 각 필드별 길이 제한
    let limitedValue = numericValue;
    if (name === 'num1' || name === 'num2' || name === 'num3' || name === 'num4') {
      limitedValue = numericValue.slice(0, 4);
    } else if (name === 'expiry') {
      limitedValue = numericValue.slice(0, 4);
      // MM/YY 형식으로 자동 포맷팅
      if (limitedValue.length >= 2) {
        limitedValue = limitedValue.slice(0, 2) + '/' + limitedValue.slice(2);
      }
    } else if (name === 'cvc') {
      limitedValue = numericValue.slice(0, 3);
    } else if (name === 'password') {
      limitedValue = numericValue.slice(0, 2);
    } else if (name === 'birth') {
      limitedValue = numericValue.slice(0, 6);
    }
    
    setCardInfo((prev) => ({ ...prev, [name]: limitedValue }));
  };

  // 이벤트 객체(e)의 타입을 명시합니다. (form 요소의 제출 이벤트)
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // 유효성 검사
    const isCardNumberComplete = cardInfo.num1.length === 4 && 
                                cardInfo.num2.length === 4 && 
                                cardInfo.num3.length === 4 && 
                                cardInfo.num4.length === 4;
    
    if (!isCardNumberComplete) {
      alert('카드 번호를 모두 입력해주세요.');
      return;
    }
    
    if (!cardInfo.expiry || cardInfo.expiry.length !== 5) {
      alert('유효 기간을 MM/YY 형식으로 입력해주세요.');
      return;
    }
    
    if (!cardInfo.cvc || cardInfo.cvc.length !== 3) {
      alert('CVC를 3자리로 입력해주세요.');
      return;
    }
    
    if (!cardInfo.password || cardInfo.password.length !== 2) {
      alert('비밀번호를 앞 2자리로 입력해주세요.');
      return;
    }
    
    if (!cardInfo.birth || cardInfo.birth.length !== 6) {
      alert('생년월일을 6자리로 입력해주세요.');
      return;
    }

    // 개발 중 서비스 안내
    alert('해당 서비스는 현재 개발 중입니다.');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="p-10 bg-slate-800 rounded-[35px]"
        // 이벤트 객체(e)의 타입을 명시합니다. (div 요소의 마우스 이벤트)
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="w-[349px] flex flex-col justify-start items-start gap-6">
          {/* 헤더 */}
          <div className="self-stretch inline-flex justify-between items-center">
            <h2 className="text-white text-lg font-medium leading-7">
              등록 카드 관리
            </h2>
            <Button type="button" onClick={onClose} variant="ghost" size="icon" className="relative">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.29279 4.29308C4.48031 4.10561 4.73462 4.00029 4.99979 4.00029C5.26495 4.00029 5.51926 4.10561 5.70679 4.29308L9.99979 8.58608L14.2928 4.29308C14.385 4.19757 14.4954 4.12139 14.6174 4.06898C14.7394 4.01657 14.8706 3.98898 15.0034 3.98783C15.1362 3.98668 15.2678 4.01198 15.3907 4.06226C15.5136 4.11254 15.6253 4.18679 15.7192 4.28069C15.8131 4.37458 15.8873 4.48623 15.9376 4.60913C15.9879 4.73202 16.0132 4.8637 16.012 4.99648C16.0109 5.12926 15.9833 5.26048 15.9309 5.38249C15.8785 5.50449 15.8023 5.61483 15.7068 5.70708L11.4138 10.0001L15.7068 14.2931C15.8889 14.4817 15.9897 14.7343 15.9875 14.9965C15.9852 15.2587 15.88 15.5095 15.6946 15.6949C15.5092 15.8803 15.2584 15.9855 14.9962 15.9878C14.734 15.99 14.4814 15.8892 14.2928 15.7071L9.99979 11.4141L5.70679 15.7071C5.51818 15.8892 5.26558 15.99 5.00339 15.9878C4.74119 15.9855 4.49038 15.8803 4.30497 15.6949C4.11956 15.5095 4.01439 15.2587 4.01211 14.9965C4.00983 14.7343 4.11063 14.4817 4.29279 14.2931L8.58579 10.0001L4.29279 5.70708C4.10532 5.51955 4 5.26525 4 5.00008C4 4.73492 4.10532 4.48061 4.29279 4.29308Z" fill="#3F3F46"/>
              </svg>
            </Button>
          </div>
          
          {/* 카드 번호 */}
          <div className="self-stretch flex flex-col justify-start items-start gap-3">
            <label className="text-white text-base font-medium leading-normal">카드 번호</label>
            <div className="self-stretch flex justify-between items-center">
              <Input 
                type="text" 
                name="num1" 
                value={cardInfo.num1} 
                onChange={handleChange} 
                maxLength={4} 
                className="w-20 h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-center focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
              <Input 
                type="text" 
                name="num2" 
                value={cardInfo.num2} 
                onChange={handleChange} 
                maxLength={4} 
                className="w-20 h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-center focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
              <Input 
                type="password" 
                name="num3" 
                value={cardInfo.num3} 
                onChange={handleChange} 
                maxLength={4} 
                className="w-20 h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-center focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
              <Input 
                type="password" 
                name="num4" 
                value={cardInfo.num4} 
                onChange={handleChange} 
                maxLength={4} 
                className="w-20 h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-center focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
            </div>
          </div>

          {/* 유효 기간 및 CVC */}
          <div className="self-stretch flex justify-between items-start gap-3">
            <div className="w-[160px] flex flex-col justify-start items-start gap-3">
              <label className="text-white text-base font-medium leading-normal">유효 기간 (MM/YY)</label>
              <Input 
                type="text" 
                name="expiry" 
                value={cardInfo.expiry} 
                onChange={handleChange} 
                placeholder="MM/YY" 
                className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
            </div>
            <div className="w-[160px] flex flex-col justify-start items-start gap-3">
              <label className="text-white text-base font-medium leading-normal">CVC</label>
              <Input 
                type="password" 
                name="cvc" 
                value={cardInfo.cvc} 
                onChange={handleChange} 
                placeholder="3자리" 
                maxLength={3} 
                className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
            </div>
          </div>

          {/* 비밀번호 및 생년월일 */}
          <div className="self-stretch flex justify-between items-start gap-3">
            <div className="w-[160px] flex flex-col justify-start items-start gap-3">
              <label className="text-white text-base font-medium leading-normal">비밀번호</label>
              <Input 
                type="password" 
                name="password" 
                value={cardInfo.password} 
                onChange={handleChange} 
                placeholder="앞 2자리" 
                maxLength={2} 
                className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
            </div>
            <div className="w-[160px] flex flex-col justify-start items-start gap-3">
              <label className="text-white text-base font-medium leading-normal">생년월일(YYMMDD)</label>
              <Input 
                type="text" 
                name="birth" 
                value={cardInfo.birth} 
                onChange={handleChange} 
                placeholder="주민번호 앞 6자리" 
                maxLength={6} 
                className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]" 
                style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            variant="brand1"
            size="lg"
            className="self-stretch py-3 bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
          >
            <div className="text-center text-white text-lg font-bold leading-7">등록</div>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default CardManagement;