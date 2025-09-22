export interface UpdateUserInfoRequest {
    categoryIds: number[];
    bankCode: string;
    accountNo: string;
    email: string;
    hash: string;
  }
  
  export interface UpdateUserInfoResponse {
    data: null;
    code: number;
    message: string;
    state: string;
  }

export interface UpdateRefundAccountRequest {
    accountNo: string;
    bankCode: string;
  }
  
  export interface UpdateRefundAccountResponse {
    data: null;
    code: number;
    message: string;
    state: string;
  }