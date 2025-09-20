import React, { useState, useEffect } from 'react';
import { startWonauth, verifyWonauth } from '@/api/wonauth';
import { updateRefundAccount } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// SVG 아이콘들을 별도 컴포넌트로 분리하여 가독성을 높입니다.
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M4.29279 4.29308C4.48031 4.10561 4.73462 4.00029 4.99979 4.00029C5.26495 4.00029 5.51926 4.10561 5.70679 4.29308L9.99979 8.58608L14.2928 4.29308C14.385 4.19757 14.4954 4.12139 14.6174 4.06898C14.7394 4.01657 14.8706 3.98898 15.0034 3.98783C15.1362 3.98668 15.2678 4.01198 15.3907 4.06226C15.5136 4.11254 15.6253 4.18679 15.7192 4.28069C15.8131 4.37458 15.8873 4.48623 15.9376 4.60913C15.9879 4.73202 16.0132 4.8637 16.012 4.99648C16.0109 5.12926 15.9833 5.26048 15.9309 5.38249C15.8785 5.50449 15.8023 5.61483 15.7068 5.70708L11.4138 10.0001L15.7068 14.2931C15.8889 14.4817 15.9897 14.7343 15.9875 14.9965C15.9852 15.2587 15.88 15.5095 15.6946 15.6949C15.5092 15.8803 15.2584 15.9855 14.9962 15.9878C14.734 15.99 14.4814 15.8892 14.2928 15.7071L9.99979 11.4141L5.70679 15.7071C5.51818 15.8892 5.26558 15.99 5.00339 15.9878C4.74119 15.9855 4.49038 15.8803 4.30497 15.6949C4.11956 15.5095 4.01439 15.2587 4.01211 14.9965C4.00983 14.7343 4.11063 14.4817 4.29279 14.2931L8.58579 10.0001L4.29279 5.70708C4.10532 5.51955 4 5.26525 4 5.00008C4 4.73492 4.10532 4.48061 4.29279 4.29308Z" fill="#3F3F46"/>
  </svg>
);


// 은행 목록
const banks = [
  {
    bankCode: '999',
    bankName: '싸피은행',
  },
  {
    bankCode: '001',
    bankName: '한국은행',
  },
  {
    bankCode: '002',
    bankName: '산업은행',
  },
  {
    bankCode: '003',
    bankName: '기업은행',
  },
  {
    bankCode: '004',
    bankName: '국민은행',
  },
  {
    bankCode: '011',
    bankName: '농협은행',
  },
  {
    bankCode: '020',
    bankName: '우리은행',
  },
  {
    bankCode: '023',
    bankName: 'SC제일은행',
  },
  {
    bankCode: '027',
    bankName: '시티은행',
  },
  {
    bankCode: '032',
    bankName: '대구은행',
  },
  {
    bankCode: '034',
    bankName: '광주은행',
  },
  {
    bankCode: '035',
    bankName: '제주은행',
  },
  {
    bankCode: '037',
    bankName: '전북은행',
  },
  {
    bankCode: '039',
    bankName: '경남은행',
  },
  {
    bankCode: '045',
    bankName: '새마을금고',
  },
  {
    bankCode: '081',
    bankName: 'KEB하나은행',
  },
  {
    bankCode: '088',
    bankName: '신한은행',
  },
  {
    bankCode: '090',
    bankName: '카카오뱅크',
  },
];

interface RefundAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
  }  

const RefundAccountModal: React.FC<RefundAccountModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const { user } = useAuthStore();

  // 각 입력 필드의 상태를 관리합니다.
  const [bank, setBank] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [authCode, setAuthCode] = useState<string>('');
  
  // 상태 관리
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [secretKey, setSecretKey] = useState<string>('');

  // 계좌번호가 16자리 숫자인지 확인
  const isAccountNumberValid = accountNumber && accountNumber.length === 16 && /^\d+$/.test(accountNumber);

  // 계좌번호 실시간 유효성 검사
  const validateAccountNumber = (value: string) => {
    if (!value) {
      setAccountNumberError('');
      return;
    }

    if (!/^\d+$/.test(value)) {
      setAccountNumberError('계좌번호는 숫자만 입력 가능합니다.');
      return;
    }

    if (value.length < 16) {
      setAccountNumberError(`계좌번호는 16자리여야 합니다. (현재 ${value.length}자리)`);
      return;
    }

    if (value.length === 16) {
      setAccountNumberError('');
      return;
    }
  };

  // '이메일 전송' 버튼 클릭 핸들러
  const handleEmailSend = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!accountNumber || !user?.email) {
      setEmailError('계좌번호와 사용자 이메일이 필요합니다.');
      return;
    }

    // 계좌번호 유효성 검사
    validateAccountNumber(accountNumber);

    // 계좌번호가 유효하지 않으면 API 호출하지 않음
    if (!isAccountNumberValid) {
      setEmailError('계좌번호가 유효하지 않습니다.');
      return;
    }

    try {
      setEmailError('');
      await startWonauth({
        accountNo: accountNumber,
        userEmail: user.email,
      });

      setIsEmailSent(true);
      setIsVerificationRequested(true);
      console.log('이메일 전송 완료');
    } catch (error: any) {
      console.error('이메일 전송 실패:', error);
      setEmailError(error.message || '이메일 전송에 실패했습니다.');
    }
  };

  // '인증 요청' 버튼 클릭 핸들러
  const handleAuthRequest = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!authCode) {
      setVerificationCodeError('인증번호를 입력하주세요.');
      return;
    }

    if (authCode.length !== 4) {
      setVerificationCodeError('인증번호는 4자리여야 합니다.');
      return;
    }

    if (!accountNumber) {
      setVerificationCodeError('계좌번호가 필요합니다.');
      return;
    }

    try {
      setVerificationCodeError('');
      const result = await verifyWonauth({
        accountNo: accountNumber,
        authCode: authCode,
      });

      if (result.code === 0) {
        setIsVerificationSuccess(true);
        setIsVerificationSent(true);
        setSecretKey(result.data.secretKey);
        // console.log('인증 완료, secretKey:', result.data.secretKey);
      } else {
        setVerificationCodeError(result.message || '인증에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('인증번호 검증 실패:', error);
      setVerificationCodeError(error.message || '인증번호가 올바르지 않습니다.');
    }
  };

  // '수정' 버튼 클릭 핸들러
  const handleSubmit = async () => {
    if (!bank || !accountNumber) {
      alert('은행과 계좌번호를 모두 입력해주세요.');
      return;
    }

    if (!isVerificationSuccess) {
      alert('계좌 인증을 완료해주세요.');
      return;
    }

    if (!user?.userId) {
      alert('사용자 정보를 찾을 수 없습니다.');
      return;
    }

    try {
      // 선택된 은행명에 해당하는 bankCode 찾기
      const selectedBank = banks.find((bankOption) => bankOption.bankName === bank);
      const bankCode = selectedBank ? selectedBank.bankCode : null;

      if (!bankCode) {
        alert('은행 코드를 찾을 수 없습니다.');
        return;
      }

      // 환불계좌 변경 API 호출
      await updateRefundAccount(user.userId, {
        accountNo: accountNumber,
        bankCode: bankCode,
      });

      alert('계좌 정보가 수정되었습니다.');
      onClose();
    } catch (error: any) {
      console.error('환불계좌 변경 실패:', error);
      alert('계좌 정보 수정에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="p-10 bg-slate-800 rounded-[35px] inline-flex justify-center items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-80 inline-flex flex-col justify-start items-start gap-6">
        {/* 헤더 */}
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="flex justify-start items-center gap-2.5">
            <div className="text-white text-lg font-medium leading-7">환불 계좌 관리</div>
          </div>
          <Button onClick={onClose} variant="ghost" size="sm" className="relative p-1 h-auto">
            <CloseIcon />
          </Button>
        </div>

        {/* 결제 은행 선택 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <Label className="self-stretch text-white text-base font-medium leading-normal">
            결제 은행
          </Label>
          <Select value={bank} onValueChange={setBank}>
            <SelectTrigger 
              className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-slate-500 text-xs font-medium focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]"
              style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
            >
              <SelectValue placeholder="은행을 선택하세요" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-zinc-500">
              {banks.map((bankOption) => (
                <SelectItem 
                  key={bankOption.bankCode} 
                  value={bankOption.bankName}
                  className="text-slate-300 hover:bg-slate-700"
                >
                  {bankOption.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 계좌 번호 입력 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <Label className="self-stretch text-white text-base font-medium leading-normal">
            계좌 번호
          </Label>
          <div className="w-80 inline-flex justify-start items-center gap-2.5">
            <Input
              type="text"
              value={accountNumber}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setAccountNumber(value);
                validateAccountNumber(value);
                // 계좌번호가 변경되면 이메일 전송 상태 초기화
                if (isEmailSent) {
                  setIsEmailSent(false);
                  setIsVerificationRequested(false);
                  setIsVerificationSuccess(false);
                }
                if (emailError) {
                  setEmailError('');
                }
              }}
              placeholder="계좌번호 16자리를 -없이 입력하세요"
              maxLength={16}
              className="flex-1 h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-xs font-medium placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]"
              style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
            />
            <Button
              onClick={handleEmailSend}
              disabled={!isAccountNumberValid}
              variant={isEmailSent ? "outline" : "tertiary"}
              size="sm"
              className="h-8 px-4 text-sm font-semibold"
            >
              {isEmailSent ? '전송 완료' : '인증 요청'}
            </Button>
          </div>
          {accountNumberError && <p className="text-red-400 text-xs mt-1">{accountNumberError}</p>}
          {isEmailSent && <p className="text-green-400 text-xs mt-1">인증 번호를 이메일에서 확인해주세요.</p>}
          {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
        </div>

        {/* 인증하기 */}
        <div className="self-stretch flex flex-col justify-start items-start gap-3">
          <Label className="self-stretch text-white text-base font-medium leading-normal">
            인증하기
          </Label>
          <div className="w-80 inline-flex justify-start items-center gap-2.5">
            <Input
              type="text"
              value={authCode}
              onChange={(e) => {
                const value = e.target.value;
                setAuthCode(value);
                // 사용자가 인증번호를 입력하기 시작하면 에러 메시지 초기화
                if (verificationCodeError) {
                  setVerificationCodeError('');
                }
                // 인증번호가 변경되면 인증 상태 초기화
                if (isVerificationSent) {
                  setIsVerificationSent(false);
                  setIsVerificationSuccess(false);
                  setSecretKey('');
                }
              }}
              placeholder="인증번호 4자리를 입력해주세요"
              maxLength={4}
              disabled={!isVerificationRequested}
              className={`flex-1 h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-white text-xs font-medium placeholder-slate-500 focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px] ${
                !isVerificationRequested ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
            />
            <Button
              onClick={handleAuthRequest}
              disabled={!isVerificationRequested}
              variant={isVerificationSent ? "outline" : "tertiary"}
              size="sm"
              className="h-8 px-4 text-sm font-semibold"
            >
              {isVerificationSent ? '확인 완료' : '코드 확인'}
            </Button>
          </div>
          {verificationCodeError && !isVerificationSuccess && (
            <p className="text-red-400 text-xs mt-1">{verificationCodeError}</p>
          )}
          {isVerificationSuccess && !verificationCodeError && (
            <p className="text-green-400 text-xs mt-1">인증이 완료되었습니다.</p>
          )}
        </div>

        {/* 수정 버튼 */}
        <Button
          onClick={handleSubmit}
          disabled={!bank || !isAccountNumberValid || !isVerificationSuccess}
          variant={bank && isAccountNumberValid && isVerificationSuccess ? "brand1" : "secondary"}
          size="lg"
          className="self-stretch py-3 text-lg font-bold"
        >
          수정
        </Button>
        </div>
      </div>
    </div>
  );
};

export default RefundAccountModal;