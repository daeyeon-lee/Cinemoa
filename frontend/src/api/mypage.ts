import { UserInfoResponse, UserInfoErrorResponse, FundingProposalsResponse, FundingProposalsErrorResponse } from '@/types/mypage';
import { apiGet } from '@/utils/apiClient';

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// 회원 정보 조회 API
export const getUserInfo = async (userId: number): Promise<UserInfoResponse> => {
  try {
    const response = await apiGet(`${BaseUrl}user/${userId}`);

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

// 내가 제안한 상영회 목록 조회 API
export const getFundingProposals = async (
  userId: number=2,
  // type?: 'funding' | 'vote',
  type?: string,
  cursor?: number,
  limit: number = 7
): Promise<FundingProposalsResponse> => {
  try {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    console.log('type:', type, 'cursor:', cursor, 'limit:', limit);
    if (type) queryParams.append('type', type);
    if (cursor) queryParams.append('cursor', cursor.toString());
    queryParams.append('limit', limit.toString());

    const response = await apiGet(`${BaseUrl}user/${userId}/funding-proposals?${queryParams}`);

    if (!response.ok) {
      const errorData: FundingProposalsErrorResponse = await response.json();
      throw new Error(errorData.message || '내가 제안한 상영회 조회에 실패했습니다.');
    }

    const data: FundingProposalsResponse = await response.json();
    console.log('내가 제안한 상영회 목록:', data);
    return data;
  } catch (error) {
    console.error('내가 제안한 상영회 조회 오류:', error);
    throw error;
  }
};
