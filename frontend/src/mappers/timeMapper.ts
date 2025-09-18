/**
 * 0~23 숫자를 00:00~23:00 형식의 시간 문자열로 변환
 * @param hour 0~23 사이의 숫자
 * @returns "00:00"~"23:00" 형식의 문자열
 */
export const formatHourToTime = (hour: number): string => {
  if (hour < 0 || hour > 23) {
    throw new Error('시간은 0~23 사이의 값이어야 합니다.');
  }
  return `${hour.toString().padStart(2, '0')}:00`;
};

/**
 * 0~23 숫자 배열을 00:00~23:00 형식의 시간 문자열 배열로 변환
 * @param hours 0~23 사이의 숫자 배열
 * @returns "00:00"~"23:00" 형식의 문자열 배열
 */
export const formatHoursToTimeArray = (hours: number[]): string[] => {
  return hours.map((hour) => formatHourToTime(hour));
};
