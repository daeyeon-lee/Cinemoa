import {
  UserInfoResponse,
  UserInfoErrorResponse,
  FundingProposalsResponse,
  FundingProposalsErrorResponse,
  ParticipatedFundingResponse,
  ParticipatedFundingErrorResponse,
  LikedFundingResponse,
  LikedFundingErrorResponse,
  SuccessFundingResponse,
} from '@/types/mypage';
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
  userId: number = 2,
  type?: 'funding' | 'vote',
  cursor?: string,
  limit: number = 7,
  paramName: 'cursor' | 'nextCursor' = 'cursor',
): Promise<FundingProposalsResponse> => {
  try {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    console.log('type:', type, 'cursor:', cursor, 'limit:', limit, 'paramName:', paramName);
    if (type) queryParams.append('type', type);
    if (cursor) queryParams.append(paramName, cursor);
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

// 내가 참여한 상영회 목록 조회 API
export const getParticipatedFunding = async (
  userId: number,
  state?: 'ALL' | 'ON_PROGRESS' | 'CLOSE',
  cursor?: string,
  limit: number = 7,
  paramName: 'cursor' | 'nextCursor' = 'cursor',
): Promise<ParticipatedFundingResponse> => {
  try {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    console.log('state:', state, 'cursor:', cursor, 'limit:', limit, 'paramName:', paramName);
    if (state && state !== 'ALL') queryParams.append('state', state);
    if (cursor) queryParams.append(paramName, cursor);
    queryParams.append('limit', limit.toString());

    const response = await apiGet(`${BaseUrl}user/${userId}/participated-funding?${queryParams}`);

    if (!response.ok) {
      const errorData: ParticipatedFundingErrorResponse = await response.json();
      throw new Error(errorData.message || '내가 참여한 상영회 조회에 실패했습니다.');
    }

    const data: ParticipatedFundingResponse = await response.json();
    console.log('내가 참여한 상영회 목록:', data);
    return data;
  } catch (error) {
    console.error('내가 참여한 상영회 조회 오류:', error);
    throw error;
  }
};

// 내가 보고싶어요 한 상영회 목록 조회 API
export const getLikedFunding = async (userId: number, type?: 'funding' | 'vote', cursor?: string, limit: number = 7, paramName: 'cursor' | 'nextCursor' = 'cursor'): Promise<LikedFundingResponse> => {
  try {
    // 쿼리 파라미터 구성
    const queryParams = new URLSearchParams();
    console.log('type:', type, 'cursor:', cursor, 'limit:', limit, 'paramName:', paramName);
    if (type) queryParams.append('type', type);
    if (cursor) queryParams.append(paramName, cursor);
    queryParams.append('limit', limit.toString());

    const response = await apiGet(`${BaseUrl}user/${userId}/like?${queryParams}`);

    if (!response.ok) {
      const errorData: LikedFundingErrorResponse = await response.json();
      throw new Error(errorData.message || '내가 보고싶어요 한 상영회 조회에 실패했습니다.');
    }

    const data: LikedFundingResponse = await response.json();
    console.log('내가 보고싶어요 한 상영회 목록:', data);
    return data;
  } catch (error) {
    console.error('내가 보고싶어요 한 상영회 조회 오류:', error);
    throw error;
  }
};

// 내가 성공한 상영회 목록 조회 API
export const getSuccessFunding = async (userId: number, limit: number = 3): Promise<SuccessFundingResponse> => {
  try {
    const url = `${BaseUrl}user/${userId}/participated-funding?state=SUCCESS&limit=${limit}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API 에러 응답:', errorData);
      throw new Error(errorData.message || '내가 성공한 상영회 조회에 실패했습니다.');
    }

    const data: SuccessFundingResponse = await response.json();
    return data;
  } catch (error) {
    console.error('성공한 상영회 조회 오류:', error);
    throw error;
  }
};
