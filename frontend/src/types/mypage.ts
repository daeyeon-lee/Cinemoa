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
// 성공한 펀딩만 조회(티켓용)
export interface SuccessFunding {
  funding: {
    fundingId: number;
    title: string;
    videoName: string;
    bannerUrl: string;
    ticketBanner: string; // 티켓용 배너 추가
    state: 'SUCCESS';
    progressRate: number;
    fundingEndsOn: string;
    screenDate?: string;
    screenMinDate?: string;
    screenMaxDate?: string;
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

export interface SuccessFundingResponse {
  state: string;
  message: string;
  code: number;
  data: {
    content: SuccessFunding[];
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

// 내가 제안한 상영회 관련 타입
export interface FundingProposal {
  funding: {
    fundingId: number;
    title: string;
    videoName: string;
    bannerUrl: string;
    state: string;
    progressRate: number;
    fundingEndsOn: string;
    screenDate?: string;
    screenMinDate?: string;
    screenMaxDate?: string;
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
    nextCursor?: string;
  };
}

export interface FundingProposalsErrorResponse {
  state: string;
  message: string;
  code: number;
}

// 내가 참여한 상영회 관련 타입
export interface ParticipatedFunding {
  funding: {
    fundingId: number;
    title: string;
    videoName: string;
    bannerUrl: string;
    state: string;
    progressRate: number;
    fundingEndsOn: string;
    screenDate?: string;
    screenMinDate?: string;
    screenMaxDate?: string;
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

export interface ParticipatedFundingResponse {
  state: string;
  message: string;
  code: number;
  data: {
    content: ParticipatedFunding[];
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface ParticipatedFundingErrorResponse {
  state: string;
  message: string;
  code: number;
}

// 내가 보고싶어요 한 상영회 관련 타입
export interface LikedFunding {
  funding: {
    fundingId: number;
    title: string;
    videoName: string;
    bannerUrl: string;
    state: string;
    progressRate: number;
    fundingEndsOn: string;
    screenDate?: string;
    screenMinDate?: string;
    screenMaxDate?: string;
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

export interface LikedFundingResponse {
  state: string;
  message: string;
  code: number;
  data: {
    content: LikedFunding[];
    hasNextPage: boolean;
    nextCursor?: string;
  };
}

export interface LikedFundingErrorResponse {
  state: string;
  message: string;
  code: number;
}

// ========================================
// 카드 컴포넌트용 통합 타입
// ========================================

/**
 * 카드 컴포넌트에서 사용하는 통합 펀딩 정보 타입
 */
export interface CardFunding {
  fundingId: number;
  title: string;
  videoName: string;
  bannerUrl: string;
  state: string;
  progressRate: number;
  fundingEndsOn: string;
  screenDate?: string;
  screenMinDate?: string;
  screenMaxDate?: string;
  price: number;
  maxPeople: number;
  participantCount: number;
  favoriteCount: number;
  isLiked: boolean;
  fundingType: 'FUNDING' | 'VOTE';
}

/**
 * 카드 컴포넌트에서 사용하는 통합 영화관 정보 타입
 */
export interface CardCinema {
  cinemaId: number;
  cinemaName: string;
  city: string;
  district: string;
}

/**
 * 카드 컴포넌트에서 사용하는 통합 아이템 타입
 */
export interface CardItem {
  funding: CardFunding;
  cinema: CardCinema;
}
