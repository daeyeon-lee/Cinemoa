/**
 * 지역 관련 상수들
 */

// 지역 목록
export const REGIONS = [
  '종로구',
  '중구',
  '용산구',
  '성동구',
  '광진구',
  '동대문구',
  '중랑구',
  '성북구',
  '강북구',
  '도봉구',
  '노원구',
  '은평구',
  '서대문구',
  '마포구',
  '양천구',
  '강서구',
  '구로구',
  '금천구',
  '영등포구',
  '동작구',
  '관악구',
  '서초구',
  '강남구',
  '송파구',
  '강동구',
];

// 상영관 타입 목록 (UI용 한글 + 백엔드용 영문 매핑)
export const THEATER_TYPES = [
  { label: '일반관', value: 'NORMAL' },
  { label: 'IMAX', value: 'IMAX' },
  { label: '4DX', value: 'FDX' },
  { label: '리클라이너', value: 'RECLINER' },
  { label: 'DOLBY', value: 'DOLBY' },
  { label: 'ScreenX', value: 'SCREENX' },
];
