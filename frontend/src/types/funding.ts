// 펀딩 생성
// 파라미터

export interface CreateFundingParams {
  userId?: number;
  // 펀딩 정보
  title?: string;
  description?: string;

  // 영화 정보
  category?: string; // 추후에 cateoryid:number로 변경
  movieTitle?: string;
  movieImage: string;

  // 상영 정보
  cinemaId?: number;
  screenday?: string;
  scrrenStartsOn?: number;
  scrrenEndsOn?: number;
  participant?: number;
}

// 응답
export interface CreateFundingResponse {
  state: string;
  message: string;
  code: number;
  //   data: FundingDetail;
}
