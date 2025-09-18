import { CreatePaymentResponse, CreatePaymentParams } from '@/types/payment';

// 결제 요청 API
export const createPayment = async (params: CreatePaymentParams): Promise<CreatePaymentResponse> => {
  try {
    const url = 'https://j13a110.p.ssafy.io:8443/api/payment';
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
