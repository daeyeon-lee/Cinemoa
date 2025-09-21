// import { WonauthStartRequest, WonauthStartResponse } from '@/types/auth';
import { WonauthStartRequest, WonauthStartResponse, WonauthVerifyRequest, WonauthVerifyResponse } from '@/types/auth';

// 1원 인증 요청 API
export const startWonauth = async (data: WonauthStartRequest): Promise<WonauthStartResponse> => {
  try {
    console.log('=== 1원 인증 요청 시작 ===');
    console.log('요청 데이터:', data);

    const response = await fetch('https://j13a110.p.ssafy.io:8443/api/wonauth/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 세션 기반 인증을 위해 쿠키 포함
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${errorData.message || 'Unknown error'}`);
    }

    const result: WonauthStartResponse = await response.json();
    console.log('=== 1원 인증 요청 성공 ===');
    // console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 1원 인증 요청 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};

// 1원 인증번호 검증 API
export const verifyWonauth = async (data: WonauthVerifyRequest): Promise<WonauthVerifyResponse> => {
  try {
    console.log('=== 1원 인증번호 검증 시작 ===');
    console.log('요청 데이터:', data);

    const response = await fetch('https://j13a110.p.ssafy.io:8443/api/wonauth/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 세션 기반 인증을 위해 쿠키 포함
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('=== API 응답 에러 ===');
      console.error('Status:', response.status);
      console.error('Error Data:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result: WonauthVerifyResponse = await response.json();
    console.log('=== 1원 인증번호 검증 성공 ===');
    // console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 1원 인증번호 검증 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};
