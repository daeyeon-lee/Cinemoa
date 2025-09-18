import { UserInfoResponse, UserInfoErrorResponse } from '@/types/mypage';

// 회원 정보 조회 API
export const getUserInfo = async (userId: number = 2): Promise<UserInfoResponse> => {
  try {
    const response = await fetch(`https://j13a110.p.ssafy.io:8443/api/user/${userId}`, {
      credentials: 'include',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData: UserInfoErrorResponse = await response.json();
      throw new Error(errorData.message || '회원 정보 조회에 실패했습니다.');
    }

    const data: UserInfoResponse = await response.json();
    return data;
  } catch (error) {
    console.error('회원 정보 조회 오류:', error);
    throw error;
  }
};