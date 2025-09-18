/**
 * 날짜 관련 매핑 유틸리티 함수들
 */

/**
 * Date 객체를 YYYY-MM-DD 형식의 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatDateToISOString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

/**
 * YYYY-MM-DD 형식의 문자열을 Date 객체로 변환
 * @param dateString - YYYY-MM-DD 형식의 문자열
 * @returns Date 객체
 */
export const parseISOStringToDate = (dateString: string): Date => {
  return new Date(dateString);
};

/**
 * Date 객체를 YYYYMMDD 형식의 문자열로 변환
 * @param date - 변환할 Date 객체
 * @returns YYYYMMDD 형식의 문자열
 */
export const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

/**
 * YYYYMMDD 형식의 문자열을 YYYY-MM-DD 형식으로 변환
 * @param yyyymmdd - YYYYMMDD 형식의 문자열
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const formatYYYYMMDDToISOString = (yyyymmdd: string): string => {
  if (yyyymmdd.length !== 8) {
    throw new Error('YYYYMMDD 형식이 올바르지 않습니다.');
  }

  const year = yyyymmdd.substring(0, 4);
  const month = yyyymmdd.substring(4, 6);
  const day = yyyymmdd.substring(6, 8);

  return `${year}-${month}-${day}`;
};

/**
 * 현재 날짜를 YYYY-MM-DD 형식으로 반환
 * @returns 현재 날짜의 YYYY-MM-DD 형식 문자열
 */
export const getCurrentDateISOString = (): string => {
  return formatDateToISOString(new Date());
};

/**
 * 날짜 문자열이 유효한 YYYY-MM-DD 형식인지 검증
 * @param dateString - 검증할 날짜 문자열
 * @returns 유효한 형식이면 true, 아니면 false
 */
export const isValidISODateString = (dateString: string): boolean => {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) {
    return false;
  }

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * YYYY-MM-DD 형식의 날짜 문자열을 한국어 형식으로 변환
 * @param dateString - YYYY-MM-DD 형식의 날짜 문자열
 * @returns "YYYY년 M월 D일 (요일)" 형식의 문자열
 */
export const formatDateToKorean = (dateString: string): string => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekday = date.toLocaleDateString('ko-KR', { weekday: 'short' });

  return `${year}년 ${month}월 ${day}일 (${weekday})`;
};
