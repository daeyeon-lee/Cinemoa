import { CreateVoteFundingParams, CreateVoteFundingResponse } from '@/types/vote';

// 펀딩 생성 API
export const creatVoteFunding = async (data: CreateVoteFundingParams): Promise<CreateVoteFundingResponse> => {
  try {
    console.log('=== 투표 펀딩 생성 API 요청 시작 ===');
    console.log('요청 데이터:', data);

    const response = await fetch('https://j13a110.p.ssafy.io:8443/api/vote', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result: CreateVoteFundingResponse = await response.json();
    console.log('=== 투표 펀딩 생성 API 요청 성공 ===');
    console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    console.error('=== 투표 펀딩 생성 API 요청 실패 ===');
    console.error('에러:', error);
    throw error;
  }
};
