export interface WonauthStartRequest {
    accountNo: string;
    userEmail: string;
}

export interface WonauthStartResponse {
    code: number;
    message: string;
    state: string;
}

export interface WonauthVerifyRequest {
    accountNo: string;
    authCode: string;
}

export interface WonauthVerifyResponse {
    data: {
        secretKey: string;
    };
    code: number;
    message: string;
    state: string;
}