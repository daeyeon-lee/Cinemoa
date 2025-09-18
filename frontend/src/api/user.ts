import { UpdateUserInfoRequest, UpdateUserInfoResponse } from '@/types/user';

// 사용자 추가 정보 입력 API
export const updateUserAdditionalInfo = async (userId: number, data: UpdateUserInfoRequest): Promise<UpdateUserInfoResponse> => {
  try {
    console.log('=== 사용자 추가 정보 입력 시작 ===');
    console.log('사용자 ID:', userId);
    console.log('요청 데이터:', data);

    const response = await fetch(`https://j13a110.p.ssafy.io:8443/api/user/${userId}`, {
      method: 'PATCH',
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

    const result: UpdateUserInfoResponse = await response.json();
    console.log('=== 사용자 추가 정보 입력 성공 ===');
    console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 사용자 추가 정보 입력 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};
