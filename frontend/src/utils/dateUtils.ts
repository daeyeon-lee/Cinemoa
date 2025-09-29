// ⛳️ 간단 유틸: 24시간 정수를 "HH:MM" 포맷으로
export const formatTime = (h: number) => String(h).padStart(2, "0") + ":00";

// ⛳️ 간단 유틸: "YYYY-MM-DD" 형태를 "YYYY년 MM월 DD일 (요일)"로
export const formatKoreanDate = (dateString: string) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const dayOfWeek = days[date.getDay()];
  return `${year}년 ${month}월 ${day}일 (${dayOfWeek})`;
};
