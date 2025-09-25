// 펀딩 생성
// 파라미터
export interface fundinginfo {
  title?: string;
  content?: string;
}

export interface movieinfo {
  categoryId?: number;
  videoName?: string;
  posterUrl?: string;
  videoContent?: string;
}

export interface theaterinfo {
  cinemaId?: number;
  screenId?: number;
  screenday?: string;
  scrrenStartsOn?: number;
  scrrenEndsOn?: number;
  maxPeople?: number;
  fundingId?: number;
  amount?: number; // 1인당 결제 금액
}

export interface CreateFundingParams {
  userId?: number;
  // 펀딩 정보
  title?: string;
  content?: string;
  // 영화 정보
  categoryId?: number;
  videoName?: string;
  videoContent?: string;
  posterUrl?: string;
  // 상영 정보
  cinemaId?: number;
  screenId?: number;
  screenDay?: string;
  screenStartsOn?: number;
  screenEndsOn?: number;
  maxPeople?: number;
}

// 응답
export interface CreateFundingResponse {
  state: string;
  message: string;
  code: number;
  data: {
    fundingId: number;
  };
}

// 상세 내역 조회
export interface DetailSummaryResponse {
  state: string;
  message: string;
  code: number;
  data: {
    processedVideoContent: string;
  };
}
