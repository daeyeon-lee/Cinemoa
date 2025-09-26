/**
 * Card Item Domain Types
 * 
 * UI 컴포넌트에서 사용하는 카드 아이템 뷰모델 타입 정의
 * 
 * DTO와 분리하는 이유:
 * 1. API 스키마 변경으로부터 UI 로직 보호
 * 2. 서버 값(fundingType) → UI 값(kind) 정규화로 type-safe한 분기 처리
 * 3. 알 수 없는 서버 값에 대한 안전한 fallback 처리
 * 4. UI에 특화된 추가 계산 필드(dDay 등) 포함 가능
 */

export type CardState = 'VOTING' | 'EVALUATING' | 'ACTIVE' | 'COMPLETE' | 'UNKNOWN';

export interface Cinema {
  id: number;
  name: string;
  city: string;
  district: string;
}

interface BaseCard {
  id: number;                                  // fundingId
  kind: 'funding' | 'vote' | 'unknown';        // 맵퍼에서 fundingType 정규화
  title: string;
  videoName: string;
  bannerUrl: string;
  cinema: Cinema;
  favoriteCount: number;
  isLiked: boolean;
  state: CardState;                             // 서버 값 정규화
  endsOn: string;                               // fundingEndsOn
  screenDate?: string;                          // 투표면 undefined
  dDay?: number;                                // TODO: 맵퍼에서 계산
}

export interface FundingCard extends BaseCard {
  kind: 'funding';
  price: number;
  progressRate: number;
  maxPeople: number;
  participantCount: number;
  screenDate: string;                           // 펀딩은 상영일이 필수
}

export interface VoteCard extends BaseCard {
  kind: 'vote';
  // TODO: 추후 voteCount, voteOptions 등 확장 가능
}

export interface UnknownCard extends BaseCard {
  kind: 'unknown';
}

export type CardItem = FundingCard | VoteCard | UnknownCard;

// Type Guards
export const isFundingCard = (card: CardItem): card is FundingCard => card.kind === 'funding';
export const isVoteCard = (card: CardItem): card is VoteCard => card.kind === 'vote';
export const isUnknownCard = (card: CardItem): card is UnknownCard => card.kind === 'unknown';

/*
변환 예시:

1. 펀딩 카드:
{
  id: 101,
  kind: 'funding',
  title: '뮤지컬 라이온킹 단체관람',
  videoName: '뮤지컬 라이온킹',
  bannerUrl: 'https://example.com/lion-king.jpg',
  state: 'EVALUATING',
  price: 8000,
  progressRate: 30,
  maxPeople: 50,
  participantCount: 15,
  screenDate: '2025-10-20',
  endsOn: '2025-10-08',
  cinema: { id: 1, name: 'CGV대학로', city: '서울시', district: '종로구' },
  favoriteCount: 232,
  isLiked: true
}

2. 투표 카드:
{
  id: 202,
  kind: 'vote',
  title: '오페라의 유령 단체관람 투표',
  videoName: '오페라의 유령',
  bannerUrl: 'https://example.com/phantom.jpg',
  state: 'VOTING',
  endsOn: '2025-09-30',
  cinema: { id: 2, name: '롯데시네마 건대입구', city: '서울시', district: '광진구' },
  favoriteCount: 120,
  isLiked: false
}
*/