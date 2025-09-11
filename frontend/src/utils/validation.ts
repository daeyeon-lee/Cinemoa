// 결제 관련 유효성 검사 함수들

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  formattedValue?: string;
}

// 유효기간 포맷팅 및 검증 (MM/YY)
export const validateAndFormatExpiryDate = (value: string): ValidationResult => {
  // 숫자만 추출
  const numbersOnly = value.replace(/\D/g, '');

  // 최대 4자리까지만 허용
  const truncated = numbersOnly.substring(0, 4);

  // 포맷팅 적용
  let formatted = truncated;
  if (truncated.length >= 3) {
    formatted = truncated.substring(0, 2) + '/' + truncated.substring(2);
  }

  // 유효성 검사
  if (truncated.length >= 2) {
    const month = parseInt(truncated.substring(0, 2));
    if (month < 1 || month > 12) {
      return {
        isValid: false,
        error: '날짜를 올바르게 입력해주세요',
        formattedValue: formatted,
      };
    }
  }

  // 완전한 형태일 때 만료일 검증
  if (truncated.length === 4) {
    const month = parseInt(truncated.substring(0, 2));
    const year = parseInt('20' + truncated.substring(2));
    const expiryDate = new Date(year, month - 1);
    const currentDate = new Date();

    if (expiryDate < currentDate) {
      return {
        isValid: false,
        error: '만료일을 올바르게 입력해주세요',
        formattedValue: formatted,
      };
    }
  }

  return {
    isValid: true,
    formattedValue: formatted,
  };
};

// 카드번호 검증 (4자리 숫자)
export const validateCardNumber = (value: string): ValidationResult => {
  const numbersOnly = value.replace(/\D/g, '');

  if (numbersOnly.length > 4) {
    return {
      isValid: false,
      error: '4자리까지만 입력 가능합니다',
      formattedValue: numbersOnly.substring(0, 4),
    };
  }

  return {
    isValid: true,
    formattedValue: numbersOnly,
  };
};

// CVC 검증 (3자리 숫자)
export const validateCVC = (value: string): ValidationResult => {
  const numbersOnly = value.replace(/\D/g, '');

  if (numbersOnly.length > 3) {
    return {
      isValid: false,
      error: '3자리까지만 입력 가능합니다',
      formattedValue: numbersOnly.substring(0, 3),
    };
  }

  return {
    isValid: true,
    formattedValue: numbersOnly,
  };
};

// 비밀번호 검증 (2자리 숫자)
export const validateCardPassword = (value: string): ValidationResult => {
  const numbersOnly = value.replace(/\D/g, '');

  if (numbersOnly.length > 2) {
    return {
      isValid: false,
      error: '2자리까지만 입력 가능합니다',
      formattedValue: numbersOnly.substring(0, 2),
    };
  }

  return {
    isValid: true,
    formattedValue: numbersOnly,
  };
};

// 생년월일 검증 (6자리 숫자)
export const validateBirthDate = (value: string): ValidationResult => {
  const numbersOnly = value.replace(/\D/g, '');

  if (numbersOnly.length > 6) {
    return {
      isValid: false,
      error: '6자리까지만 입력 가능합니다',
      formattedValue: numbersOnly.substring(0, 6),
    };
  }

  // 완전한 형태일 때 날짜 유효성 검사
  if (numbersOnly.length === 6) {
    const year = parseInt(numbersOnly.substring(0, 2));
    const month = parseInt(numbersOnly.substring(2, 4));
    const day = parseInt(numbersOnly.substring(4, 6));

    // 기본적인 날짜 유효성 검사
    if (month < 1 || month > 12) {
      return {
        isValid: false,
        error: '올바른 월을 입력해주세요',
        formattedValue: numbersOnly,
      };
    }

    if (day < 1 || day > 31) {
      return {
        isValid: false,
        error: '올바른 일을 입력해주세요',
        formattedValue: numbersOnly,
      };
    }
  }

  return {
    isValid: true,
    formattedValue: numbersOnly,
  };
};

// 모든 필드 완성 여부 검사
export const validateAllPaymentFields = (paymentData: {
  cardNumber1: string;
  cardNumber2: string;
  cardNumber3: string;
  cardNumber4: string;
  expiryDate: string;
  cvc: string;
  password: string;
  birthDate: string;
  termsAgreed: boolean;
}): ValidationResult => {
  const isComplete =
    paymentData.cardNumber1.length === 4 &&
    paymentData.cardNumber2.length === 4 &&
    paymentData.cardNumber3.length === 4 &&
    paymentData.cardNumber4.length === 4 &&
    paymentData.expiryDate.length === 5 && // MM/YY 형식
    paymentData.cvc.length === 3 &&
    paymentData.password.length === 2 &&
    paymentData.birthDate.length === 6 &&
    paymentData.termsAgreed;

  return {
    isValid: isComplete,
    error: isComplete ? undefined : '모든 필수 항목을 입력해주세요',
  };
};
