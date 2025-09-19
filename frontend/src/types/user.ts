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