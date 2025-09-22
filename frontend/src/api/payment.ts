import { CreatePaymentResponse, CreatePaymentParams, HoldSeatsResponse } from '@/types/payment';
const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// 결제 전 자리차지 요청 API
export const holdSeats = async (fundingId: number, userId: number): Promise<HoldSeatsResponse> => {
  try {
    const url = `${BaseUrl}funding/${fundingId}/hold`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(userId),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    const result = await response.json();
    console.log('응답 데이터:', result);
    return result;
  } catch (error) {
    console.error('에러:', error);
    throw error;
  } finally {
    console.log('자리차지 요청 완료');
  }
};

// 결제 요청 API
export const createPayment = async (params: CreatePaymentParams): Promise<CreatePaymentResponse> => {
  try {
    const url = `${BaseUrl}payment`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    console.log('응답 데이터:', result);
    return result;
  } catch (error) {
    console.error('에러:', error);
    throw error;
  }
};
