// API 공통 envelope
export type ApiResponse<T> = {
  state: string;   // "SUCCESS" 등
  message: string; // 응답 메시지
  code: number;    // 응답 코드
  data: T;         // 실제 payload
};

/* =========================
   Funding 상세 응답 타입
   ========================= */
export type FundingDetailData = {
  type: 'FUNDING'; // 판별자(discriminant)

  // 기본 펀딩 정보
  funding: {
    bannerUrl: string;
    content: string;
    fundingEndsOn: string;  // 종료일
    fundingId: number;
    price: number;          // 티켓 가격
    progressRate: number;   // 달성률
    screenDate: string;     // 상영 예상일
    state: string;          // "ON_PROGRESS" 등
    title: string;
  };

  // 제안자 정보
  proposer: {
    proposerId: number;
    nickname: string;
    profileImgUrl: string;
  };

  // 상영 정보 (펀딩은 '시각만 숫자'로 제공)
  screening: {
    videoName: string;
    videoContent?: string;
    screenStartsOn: number; // 예: 19 (19시)
    screenEndsOn: number;   // 예: 21 (21시)
  };

  // 모집/참여 정보
  stat: {
    maxPeople: number;
    participantCount: number;
    viewCount: number;
    likeCount: number;
    isLiked: boolean;
    isParticipated?: boolean; // 🆕 아직 없지만, 나중에 들어올 수 있음
  };

  // 카테고리 정보
  category: {
    categoryId: number;
    categoryName: string;
    parentCategoryId: number;
    parentCategoryName: string;
  },

  // 상영관 정보
  screen: {
    screenId: number;
    screenName: string;
    isImax: boolean;
    isScreenx: boolean;
    is4dx: boolean;
    isDolby: boolean;
    isRecliner: boolean;
  };

  // 영화관 정보
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
    address: string;
  };
};

/* =========================
   Vote 상세 응답 타입
   ========================= */
export type VoteDetailData = {
  type: 'VOTE'; // 판별자(discriminant)

  // 기본 투표 정보
  funding: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    content: string;
    state: string;
    progressRate: number;   // 달성률
    fundingEndsOn: string;   // 종료일 (ISO string)
    screenMinDate: string;   // 상영 시작일 (ISO string)
    screenMaxDate: string;   // 상영 종료일 (ISO string)
    price: number;          // 티켓 가격
  };

  // 제안자 정보
  proposer: {
    proposerId: number;
    nickname: string;
    profileImgUrl: string;
  };

  // 상영 정보 (투표는 ISO string으로 제공)
  screening: {
    videoName: string;
    videoContent?: string;
  };

  // 참여 정보
  stat: {
    maxPeople: number;
    participantCount: number;
    viewCount: number;
    likeCount: number;
    isLiked: boolean;
  };

  // 카테고리 정보
  category: {
    categoryId: number;
    categoryName: string;
    parentCategoryId: number;
    parentCategoryName: string;
  },

  // 영화관 정보
  cinema: {
    address: string;
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
  };
};

/* =========================
   두 타입을 합친 판별자 유니온
   ========================= */
export type DetailData = FundingDetailData | VoteDetailData;
