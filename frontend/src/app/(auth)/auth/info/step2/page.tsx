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
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { startWonauth, verifyWonauth } from '@/api/wonauth';
import { updateUserAdditionalInfo } from '@/api/user';

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
  const router = useRouter();
  const { updateUserInfo, user } = useAuthStore();

  // 카테고리 이름을 ID로 매핑하는 함수 (실제 DB 데이터 기준)
  const getCategoryIds = (preferences: any): number[] => {
    const categoryIds: number[] = [];

    // 영화 카테고리 매핑 (parent_category_id = 1)
    const movieMap: { [key: string]: number } = {
      액션: 5,
      '공포/스릴러': 6,
      음악: 7,
      '판타지/SF': 8,
      애니메이션: 9,
      기타: 10,
    };

    // 시리즈 카테고리 매핑 (parent_category_id = 2)
    const seriesMap: { [key: string]: number } = {
      액션: 11,
      '공포/스릴러': 12,
      음악: 13,
      '판타지/SF': 14,
      애니메이션: 15,
      기타: 16,
    };

    // 공연 카테고리 매핑 (parent_category_id = 3)
    const performanceMap: { [key: string]: number } = {
      외국가수: 17,
      한국가수: 18,
      클래식: 19,
      '뮤지컬 ': 20, // 공백 포함
      기타: 21,
    };

    // 스포츠 카테고리 매핑 (parent_category_id = 4)
    const sportsMap: { [key: string]: number } = {
      축구: 22,
      야구: 23,
      F1: 24,
      e스포츠: 25, // 소문자 e
      기타: 26,
    };

    // 각 카테고리 타입별로 매핑
    if (preferences?.movie) {
      preferences.movie.forEach((category: string) => {
        const id = movieMap[category];
        if (id) categoryIds.push(id);
      });
    }

    if (preferences?.series) {
      preferences.series.forEach((category: string) => {
        const id = seriesMap[category];
        if (id) categoryIds.push(id);
      });
    }

    if (preferences?.performance) {
      preferences.performance.forEach((category: string) => {
        const id = performanceMap[category];
        if (id) categoryIds.push(id);
      });
    }

    if (preferences?.sports) {
      preferences.sports.forEach((category: string) => {
        const id = sportsMap[category];
        if (id) categoryIds.push(id);
      });
    }

    return categoryIds;
  };
  const [isVerificationRequested, setIsVerificationRequested] = useState(false);
  const [verificationCodeError, setVerificationCodeError] = useState('');
  const [accountNumberError, setAccountNumberError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isVerificationSuccess, setIsVerificationSuccess] = useState(false);
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [secretKey, setSecretKey] = useState<string>('');

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

  const onSubmit = async (values: FormData) => {
    if (!user || !secretKey) {
      console.error('사용자 정보 또는 secretKey가 없습니다.');
      return;
    }

    // 선택된 은행명에 해당하는 bankCode 찾기
    const selectedBank = banks.find((bank) => bank.bankName === values.bank);
    const bankCode = selectedBank ? selectedBank.bankCode : null;

    if (!bankCode) {
      console.error('은행 코드를 찾을 수 없습니다.');
      return;
    }

    // 카테고리 ID 매핑
    console.log('=== 카테고리 정보 확인 ===');
    console.log('사용자 preferences:', user.preferences);
    const categoryIds = getCategoryIds(user.preferences);
    console.log('변환된 카테고리 IDs:', categoryIds);

    if (categoryIds.length === 0) {
      console.error('선택된 카테고리가 없습니다.');
      return;
    }

    try {
      console.log('=== 회원가입 완료 API 호출 ===');
      console.log('사용자 ID:', user.userId);
      console.log('카테고리 IDs:', categoryIds);
      // console.log('은행 코드:', bankCode);
      // console.log('계좌번호:', values.accountNumber);
      console.log('이메일:', user.email);
      // console.log('SecretKey:', secretKey);

      // 추가 정보 입력 API 호출
      await updateUserAdditionalInfo(user.userId, {
        categoryIds,
        bankCode,
        accountNo: values.accountNumber,
        email: user.email,
        hash: secretKey,
      });

      // 회원가입 완료 - 사용자 정보 업데이트 (isAnonymous를 false로 변경)
      updateUserInfo({ isAnonymous: false });

      console.log('회원가입 완료!');
      // 홈페이지로 이동
      router.push('/home');
    } catch (error: any) {
      console.error('회원가입 완료 실패:', error);
      alert('회원가입 완료에 실패했습니다: ' + (error.message || '알 수 없는 오류'));
    }
  };

  const handleEmailSend = async (e: React.MouseEvent) => {
    e.preventDefault(); // 폼 제출 방지
    e.stopPropagation(); // 이벤트 전파 방지

    const accountNumber = form.getValues('accountNumber');

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
      setIsVerificationRequested(true); // 이메일 전송 성공 시 인증번호 입력 필드 활성화
      console.log('이메일 전송 완료');
    } catch (error: any) {
      console.error('이메일 전송 실패:', error);
      setEmailError(error.message || '이메일 전송에 실패했습니다.');
    }
  };

  const handleVerificationRequest = async (e: React.MouseEvent) => {
    e.preventDefault(); // 폼 제출 방지
    e.stopPropagation(); // 이벤트 전파 방지

    // 인증번호 검증
    const verificationCode = form.getValues('verificationCode');
    const accountNumber = form.getValues('accountNumber');

    if (!verificationCode) {
      setVerificationCodeError('인증번호를 입력해주세요.');
      return;
    }

    if (verificationCode.length !== 4) {
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
        authCode: verificationCode,
      });

      if (result.code === 0) {
        setIsVerificationSuccess(true);
        setIsVerificationSent(true);
        setSecretKey(result.data.secretKey);
        console.log('인증 완료, secretKey:', result.data.secretKey);
      } else {
        setVerificationCodeError(result.message || '인증에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('인증번호 검증 실패:', error);
      setVerificationCodeError(error.message || '인증번호가 올바르지 않습니다.');
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
          {form.formState.errors.bank && <p className="text-Brand1-Primary p2-b mt-1">{form.formState.errors.bank.message}</p>}
        </div>

        {/* 계좌 번호 */}
        <div>
          <Label htmlFor="accountNumber" className="text-p2-b text-primary mb-2 block">
            계좌 번호
          </Label>
          <div className="flex gap-2 sm:h-10 md:h-12">
            <Input
              id="accountNumber"
              {...form.register('accountNumber', {
                onChange: (e) => {
                  validateAccountNumber(e.target.value);
                  // 계좌번호가 변경되면 이메일 전송 상태 초기화
                  if (isEmailSent) {
                    setIsEmailSent(false);
                    setIsVerificationRequested(false); // 인증번호 입력 필드도 비활성화
                    setIsVerificationSuccess(false); // 인증 성공 상태도 초기화
                  }
                  if (emailError) {
                    setEmailError('');
                  }
                },
              })}
              placeholder="계좌번호 16자리를 -없이 입력해주세요"
              maxLength={16}
              className="w-full h-10 sm:h-full sm:flex-1"
            />
            <Button
              type="button"
              onClick={handleEmailSend}
              variant={isEmailSent ? 'outline' : 'tertiary'}
              disabled={!isAccountNumberValid}
              className="h-10 sm:h-full sm:w-auto sm:min-w-[100px] md:min-w-[120px]"
            >
              {isEmailSent ? '전송 완료' : '인증 번호 요청'}
            </Button>
          </div>
          {(form.formState.errors.accountNumber || accountNumberError) && <p className="text-Brand1-Primary p2 mt-1">{form.formState.errors.accountNumber?.message || accountNumberError}</p>}
          {isEmailSent && <p className="text-Brand2-Primary p2 mt-1">인증 번호를 이메일에서 확인해주세요.</p>}
          {emailError && <p className="text-Brand1-Primary p2 mt-1">{emailError}</p>}
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
                  // 인증번호가 변경되면 인증 상태 초기화
                  if (isVerificationSent) {
                    setIsVerificationSent(false);
                    setIsVerificationSuccess(false);
                    setSecretKey(''); // secretKey도 초기화
                  }
                },
              })}
              placeholder="인증번호 4자리를 입력해주세요"
              maxLength={4}
              disabled={!isVerificationRequested}
              className="w-full h-10 sm:h-full sm:flex-1"
            />
            <Button
              type="button"
              onClick={handleVerificationRequest}
              variant={isVerificationSent ? 'outline' : 'tertiary'}
              disabled={!isVerificationRequested}
              className="h-10 sm:h-full sm:w-auto sm:min-w-[100px] md:min-w-[120px]"
            >
              {isVerificationSent ? '인증 완료' : '인증 요청'}
            </Button>
          </div>
          {(form.formState.errors.verificationCode || verificationCodeError) && !isVerificationSuccess && (
            <p className="text-Brand1-Primary p2 mt-1">{form.formState.errors.verificationCode?.message || verificationCodeError}</p>
          )}
          {isVerificationSuccess && !verificationCodeError && <p className="text-Brand2-Primary p2 mt-1">인증이 완료되었습니다.</p>}
        </div>
      </form>

      {/* 버튼들 */}
      <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Link href="/auth/info/step1" className="w-full sm:flex-1">
          <Button variant="tertiary" size="lg" className="w-full h-12 sm:h-14">
            이전
          </Button>
        </Link>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={!form.formState.isValid} size="lg" variant={form.formState.isValid ? 'brand1' : 'tertiary'} className="w-full sm:flex-1 h-12 sm:h-14">
          회원가입 완료하기
        </Button>
      </div>
    </div>
  );
}
