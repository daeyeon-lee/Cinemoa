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

// 내가 제안한 상영회 관련 타입
export interface FundingProposal {
  funding: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    state: string;
    progressRate: number;
    fundingEndsOn: string;
    screenDate: string;
    price: number;
    maxPeople: number;
    participantCount: number;
    favoriteCount: number;
    isLiked: boolean;
    fundingType: 'FUNDING' | 'VOTE';
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
  };
}

export interface FundingProposalsResponse {
  state: string;
  message: string;
  code: number;
  data: {
    content: FundingProposal[];
    hasNextPage: boolean;
  };
}

export interface FundingProposalsErrorResponse {
  state: string;
  message: string;
  code: number;
}


