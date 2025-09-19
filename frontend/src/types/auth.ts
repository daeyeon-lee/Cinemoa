// 백에서 로그인 성공 시 받을 응답 타입
export interface LoginResponse {
    data: {
      userId: number;
      email: string;
      isAnonymous: boolean;
    };
    code: number;
    message: string;
    state: string;
  }

// 1원 인증 요청 시 백으로 전송할 데이터 타입
export interface WonauthStartRequest {
    accountNo: string;
    userEmail: string;
}

// 1원 인증 요청 시 백에서 받을 응답 타입
export interface WonauthStartResponse {
    code: number;
    message: string;
    state: string;
}

// 1원 인증 검증 시 백으로 전송할 데이터 타입
export interface WonauthVerifyRequest {
    accountNo: string;
    authCode: string;
}

// 1원 인증 검증 시 백에서 받을 응답 타입
export interface WonauthVerifyResponse {
    data: {
        secretKey: string;
    };
    code: number;
    message: string;
    state: string;
}

// 로그아웃 시 백에서 받을 응답 타입
export interface LogoutResponse {
    code: number;
    message: string;
    state: string;
  }