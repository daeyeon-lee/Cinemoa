// 회원 정보 조회 관련 타입
export interface UserInfo {
  nickname: string;
  profileImgUrl: string;
}

export interface UserInfoResponse {
  state: string;
  message: string;
  code: number;
  data: UserInfo;
}

export interface UserInfoErrorResponse {
  state: string;
  message: string;
  code: number;
}


