import React, { useState, useEffect } from 'react';
import { startWonauth, verifyWonauth } from '@/api/wonauth';
import { updateRefundAccount } from '@/api/user';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BaseModal from './BaseModal';

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
        console.log('인증 완료');
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
    // 유효성 검사 먼저 수행
    if (!bank || !accountNumber) {
      alert('은행과 계좌번호를 모두 입력해주세요.');
      return;
    }

    if (!isAccountNumberValid) {
      alert('계좌번호를 올바르게 입력해주세요.');
      return;
    }

    if (!isVerificationSuccess) {
      alert('계좌 인증을 완료해주세요.');
      return;
    }

    // 모든 조건이 만족되었을 때만 서비스 미지원 메시지 표시
    // TODO: 백엔드 API가 완성되면 주석 해제
    alert('아직 지원하지 않는 서비스입니다.');
    return;

    // if (!bank || !accountNumber) {
    //   alert('은행과 계좌번호를 모두 입력해주세요.');
    //   return;
    // }

    // if (!isVerificationSuccess) {
    //   alert('계좌 인증을 완료해주세요.');
    //   return;
    // }

    // if (!user?.userId) {
    //   alert('사용자 정보를 찾을 수 없습니다.');
    //   return;
    // }

    // try {
    //   // 선택된 은행명에 해당하는 bankCode 찾기
    //   const selectedBank = banks.find((bankOption) => bankOption.bankName === bank);
    //   const bankCode = selectedBank ? selectedBank.bankCode : null;

    //   if (!bankCode) {
    //     alert('은행 코드를 찾을 수 없습니다.');
    //     return;
    //   }

    //   // 환불계좌 변경 API 호출
    //   await updateRefundAccount(user.userId, {
    //     accountNo: accountNumber,
    //     bankCode: bankCode,
    //   });

    //   alert('계좌 정보가 수정되었습니다.');
    //   onClose();
    // } catch (error: any) {
    //   console.error('환불계좌 변경 실패:', error);
    //   alert('계좌 정보 수정에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    // }
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="환불 계좌 관리">
      {/* 결제 은행 선택 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        <Label className="self-stretch text-white text-base font-medium leading-normal">결제 은행</Label>
        <Select value={bank} onValueChange={setBank}>
          <SelectTrigger
            className="w-full h-8 px-3 py-1.5 bg-slate-800 rounded-lg text-slate-500 text-xs font-medium focus:bg-slate-900 focus:outline focus:outline-1 focus:outline-slate-600 focus:outline-offset-[-1px]"
            style={{ outline: '1px solid #7C7F88', outlineOffset: '-1px' }}
          >
            <SelectValue placeholder="은행을 선택하세요" />
          </SelectTrigger>
          <SelectContent className="bg-slate-800 border-zinc-500">
            {banks.map((bankOption) => (
              <SelectItem key={bankOption.bankCode} value={bankOption.bankName} className="text-slate-300 hover:bg-slate-700">
                {bankOption.bankName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 계좌 번호 입력 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        <Label className="self-stretch text-white text-base font-medium leading-normal">계좌 번호</Label>
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
          <Button onClick={handleEmailSend} disabled={!isAccountNumberValid} variant={isEmailSent ? 'outline' : 'tertiary'} size="sm" className="h-8 px-4 text-sm font-semibold">
            {isEmailSent ? '전송 완료' : '인증 요청'}
          </Button>
        </div>
        {accountNumberError && <p className="text-red-400 text-xs mt-1">{accountNumberError}</p>}
        {isEmailSent && <p className="text-green-400 text-xs mt-1">인증 번호를 이메일에서 확인해주세요.</p>}
        {emailError && <p className="text-red-400 text-xs mt-1">{emailError}</p>}
      </div>

      {/* 인증하기 */}
      <div className="self-stretch flex flex-col justify-start items-start gap-3">
        <Label className="self-stretch text-white text-base font-medium leading-normal">인증하기</Label>
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
          <Button onClick={handleAuthRequest} disabled={!isVerificationRequested} variant={isVerificationSent ? 'outline' : 'tertiary'} size="sm" className="h-8 px-4 text-sm font-semibold">
            {isVerificationSent ? '확인 완료' : '코드 확인'}
          </Button>
        </div>
        {verificationCodeError && !isVerificationSuccess && <p className="text-red-400 text-xs mt-1">{verificationCodeError}</p>}
        {isVerificationSuccess && !verificationCodeError && <p className="text-green-400 text-xs mt-1">인증이 완료되었습니다.</p>}
      </div>

      {/* 수정 버튼 */}
      <Button onClick={handleSubmit} variant={bank && isAccountNumberValid && isVerificationSuccess ? 'brand1' : 'secondary'} size="lg" className="self-stretch py-3 text-lg font-bold">
        수정
      </Button>
    </BaseModal>
  );
};

export default RefundAccountModal;
