'use client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';

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

// 폼 정의
const formSchema = z.object({
  bank: z.string().min(1, {
    message: '은행을 선택해주세요.',
  }),
  accountNumber: z
    .string()
    .min(1, {
      message: '계좌번호를 입력해주세요.',
    })
    .length(16, {
      message: '계좌번호는 16자리여야 합니다.',
    })
    .regex(/^\d+$/, {
      message: '계좌번호는 숫자만 입력 가능합니다.',
    }),
  verificationCode: z.string().min(1, {
    message: '인증번호를 입력해주세요.',
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function Step2Page() {
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: 'onChange', // 실시간 검증을 위해 추가
    defaultValues: {
      bank: '',
      accountNumber: '',
      verificationCode: '',
    },
  });

  // 계좌번호가 16자리 숫자인지 확인
  const accountNumber = form.watch('accountNumber');
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

  const onSubmit = (values: FormData) => {
    // 선택된 은행명에 해당하는 bankCode 찾기
    const selectedBank = banks.find((bank) => bank.bankName === values.bank);
    const bankCode = selectedBank ? selectedBank.bankCode : null;

    console.log('폼 데이터:', {
      ...values,
      bankCode: bankCode,
    });
    // 여기에 회원가입 완료 로직 추가
  };

  const handleVerificationRequest = () => {
    if (isVerificationRequested) {
      // 인증 완료 버튼을 눌렀을 때 - 인증번호 검증
      const verificationCode = form.getValues('verificationCode');

      if (!verificationCode) {
        setVerificationCodeError('인증번호를 입력해주세요.');
        return;
      }

      if (verificationCode.length !== 4) {
        setVerificationCodeError('인증번호는 4자리여야 합니다.');
        return;
      }

      // 인증 완료 로직
      setVerificationCodeError('');
      console.log('인증 완료');
    } else {
      // 인증 요청 버튼을 눌렀을 때
      setIsVerificationRequested(true);
      // 인증 요청 로직 추가
      // 인증 요청 시 post 요청(인증번호 발송)
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 py-8 sm:py-12">
      {/* 헤더 */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-h4-b sm:text-h3-b mb-2">필수 정보 입력하기</h1>
      </div>
      <div className="mt-6 sm:mt-10 mb-6 sm:mb-8 border-b border-stroke-4">
        <h2 className="text-h6-b sm:text-h5-b mb-1">환불 계좌 등록하기</h2>
      </div>

      {/* 폼 */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
        {/* 결제 은행 */}
        <div>
          <Label htmlFor="bank" className="text-p2-b text-primary mb-2 block">
            결제 은행
          </Label>
          <Select onValueChange={(value) => form.setValue('bank', value)} defaultValue={form.getValues('bank')}>
            <SelectTrigger className="w-full h-10 sm:h-12">
              <SelectValue placeholder="은행을 선택해주세요" />
            </SelectTrigger>
            <SelectContent>
              {banks.map((bank) => (
                <SelectItem key={bank.bankCode} value={bank.bankName}>
                  {bank.bankName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.bank && (
            <p className="text-Brand1-Primary text-xs mt-1">{form.formState.errors.bank.message}</p>
          )}
        </div>

        {/* 계좌 번호 */}
        <div>
          <Label htmlFor="accountNumber" className="text-p2-b text-primary mb-2 block">
            계좌 번호
          </Label>
          <Input
            id="accountNumber"
            {...form.register('accountNumber', {
              onChange: (e) => {
                validateAccountNumber(e.target.value);
              },
            })}
            placeholder="계좌번호 16자리를 -없이 입력해주세요"
            maxLength={16}
            className="w-full h-10 sm:h-12"
          />
          {(form.formState.errors.accountNumber || accountNumberError) && (
            <p className="text-Brand1-Primary text-caption1-b mt-1">
              {form.formState.errors.accountNumber?.message || accountNumberError}
            </p>
          )}
        </div>

        {/* 인증 번호 */}
        <div>
          <Label htmlFor="verificationCode" className="text-p2-b text-primary mb-2 block">
            인증 번호
          </Label>
          <div className="flex gap-2 sm:h-10 md:h-12">
            <Input
              id="verificationCode"
              {...form.register('verificationCode', {
                onChange: () => {
                  // 사용자가 인증번호를 입력하기 시작하면 에러 메시지 초기화
                  if (verificationCodeError) {
                    setVerificationCodeError('');
                  }
                },
              })}
              placeholder="인증번호 4자리를 입력해주세요"
              maxLength={4}
              disabled={!isVerificationRequested}
              className="w-full h-10 sm:h-full sm:flex-1"
            />
            <Button
              onClick={handleVerificationRequest}
              variant={isVerificationRequested ? 'outline' : 'tertiary'}
              disabled={!isAccountNumberValid}
              className="h-10 sm:h-full sm:w-auto sm:min-w-[100px] md:min-w-[120px]"
            >
              {isVerificationRequested ? '인증 완료' : '인증 요청'}
            </Button>
          </div>
          {(form.formState.errors.verificationCode || verificationCodeError) && (
            <p className="text-Brand1-Primary text-caption1-b mt-1">
              {form.formState.errors.verificationCode?.message || verificationCodeError}
            </p>
          )}
        </div>
      </form>

      {/* 버튼들 */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Link href="/auth/info/step1" className="w-full sm:flex-1">
          <Button variant="tertiary" size="lg" className="w-full h-12 sm:h-14">
            이전
          </Button>
        </Link>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={!form.formState.isValid}
          size="lg"
          variant={form.formState.isValid ? 'brand1' : 'tertiary'}
          className="w-full sm:flex-1 h-12 sm:h-14"
        >
          회원가입 완료하기
        </Button>
      </div>
    </div>
  );
}
