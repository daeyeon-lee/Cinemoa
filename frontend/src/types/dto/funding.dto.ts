/**
 * Funding DTO
 * 
 * API에서 전달받는 funding 객체의 타입 정의
 * fundingType에 따라 일부 필드가 null일 수 있음:
 * - FUNDING: 모든 필드 값 존재
 * - VOTE: progressRate, screenDate, price, maxPeople, participantCount가 null
 */

export interface FundingDto {
  fundingId: number;
  title: string;
  videoName: string;
  bannerUrl: string;
  state: string;
  progressRate: number | null;
  fundingEndsOn: string;
  screenDate: string | null;
  price: number | null;
  maxPeople: number | null;
  participantCount: number | null;
  favoriteCount: number;
  isLiked: boolean;
  fundingType: "FUNDING" | "VOTE";
}