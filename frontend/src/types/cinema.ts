// 모든 영화관 조회(Get)

// 파라미터
export interface CinemaParams {
  city?: string;
  district?: string;
  feature?: string[];
  cinemald?: number;
}

// 응답
export interface CinemaResponse {
  cinemaId?: number;
  cinemaName?: string;
  city?: string;
  district?: string;
  isImax?: boolean;
  isScreenx?: boolean;
  isDolby?: boolean;
  isRecliner?: boolean;
  is4dx?: boolean;
}

// 특정 영화관 조회(Get)
// 상영관 정보
export interface Screen {
  screenId?: number;
  screenName?: string;
  seats?: number;
  price?: number;
  imax?: boolean;
  screenx?: boolean;
  '4dx'?: boolean;
  dolby?: boolean;
  recliner?: boolean;
}

// 극장 상세 정보 조회(Get)
export interface CinemaDetailResponse {
  cinemaId?: number;
  cinemaName?: string;
  city?: string;
  district?: string;
  screens?: Screen[];
  imax?: boolean;
  screenx?: boolean;
  '4dx'?: boolean;
  dolby?: boolean;
  recliner?: boolean;
  code?: number;
  message?: string;
  state?: string;
}

// 예약 가능 시간 정보 조회(Get)
export interface ReservationTime {
  available_time: number[]; // 사용 가능한 시간대 (0-23시)
}
