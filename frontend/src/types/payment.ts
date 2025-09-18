// 펀딩 참여금 결제제 생성
// 파라미터
export interface CreatePaymentParams {
  cardNumber?: string; // 숫자만 16자리 ex.1234567890123456
  cardCvc?: string;
  fundingId?: number;
  userId?: number;
  amount?: number;
}

export interface CreatePaymentResponse {
  state: string;
  message: string;
  code: number;
  data: {
    transactionUniqueNo: number;
    fundingId: number;
    userId: number;
    paymentInfo: {
      amount: number;
      cardNumber: string;
      merchantName: string;
      transactionDateTime: string;
    };
  };
}
