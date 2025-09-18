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
}

export interface theaterinfo {
  cinemaId?: number;
  screenId?: number;
  screenday?: string;
  scrrenStartsOn?: number;
  scrrenEndsOn?: number;
  maxPeople?: number;
}

export interface CreateFundingParams {
  userId?: number;
  // 펀딩 정보
  fundinginfo?: fundinginfo;
  // 영화 정보
  movieinfo?: movieinfo;
  // 상영 정보
  theaterinfo?: theaterinfo;
}

// 응답
export interface CreateFundingResponse {
  state: string;
  message: string;
  code: number;
  //   data: FundingDetail;
}
