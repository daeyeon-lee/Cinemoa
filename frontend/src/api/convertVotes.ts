import { ConvertVotesParams, CreateFundingResponse } from '@/types/funding';

const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// 투표를 펀딩으로 전환하는 API
export const convertVotes = async (fundingId: number, data: ConvertVotesParams): Promise<CreateFundingResponse> => {
  try {
    // console.log('=== 투표를 펀딩으로 전환 API 요청 시작 ===');
    // console.log('fundingId:', fundingId);
    // console.log('요청 데이터:', data);

    const response = await fetch(`${BaseUrl}funding/${fundingId}/convert-to-funding`, {
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

    const result: CreateFundingResponse = await response.json();
    // console.log('=== 투표를 펀딩으로 전환 API 요청 성공 ===');
    // console.log('응답 데이터:', result);

    return result;
  } catch (error) {
    // console.error('=== 투표를 펀딩으로 전환 API 요청 실패 ===');
    // console.error('에러:', error);
    throw error;
  }
};
