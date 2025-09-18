// 펀딩 생성
// 파라미터
export interface VoteFundinginfo {
  title?: string;
  content?: string;
}

export interface VoteMovieinfo {
  categoryId?: number;
  videoName?: string;
  posterUrl?: string;
}

export interface VoteTheaterinfo {
  cinemaId?: number;
  screenMinDate?: string;
  screenMaxDate?: string;
}

export interface CreateVoteFundingParams {
  userId?: number;
  // 펀딩 정보
  content?: string;
  title?: string;
  // 영화 정보
  categoryId?: number;
  videoName?: string;
  // posterUrl?: string;
  // 상영 정보
  cinemaId?: number;
  screenMinDate?: string;
  screenMaxDate?: string;
}

// 응답
export interface CreateVoteFundingResponse {
  state: string;
  message: string;
  code: number;
  //   data: FundingDetail;
}
