const BaseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export const refundPayment = async (fundingId: number, userId: number): Promise<unknown> => {
  try {
    const url = `${BaseUrl}payment/refund`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        fundingId,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`HTTP error! status: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    const result = await response.json();
    // console.log('환불 응답 데이터:', result);
    return result;
  } catch (error) {
    console.error('환불 에러:', error);
    throw error;
  }
};
