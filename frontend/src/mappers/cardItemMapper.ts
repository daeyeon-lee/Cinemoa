/**
 * Card Item Mapper
 * 
 * DTO → CardItem 변환기
 * 
 * 정규화 정책:
 * 1. fundingType → kind 매핑 (알 수 없는 값은 'unknown')
 * 2. state 값 정규화 (알 수 없는 값은 'UNKNOWN')
 * 3. null 값 처리 (펀딩 전용 필드의 기본값 정책)
 * 4. 런타임 안전성 보장
 */

import type { FundingDto } from '@/types/dto/funding.dto';
import type { CinemaDto } from '@/types/dto/cinema.dto';
import type { CardItem, CardState, FundingCard, VoteCard, UnknownCard } from '@/types/cardItem';

/**
 * fundingType을 UI kind로 정규화
 */
function normalizeFundingType(fundingType: string): 'funding' | 'vote' | 'unknown' {
  switch (fundingType) {
    case 'FUNDING':
      return 'funding';
    case 'VOTE':
      return 'vote';
    default:
      console.warn(`Unknown fundingType: ${fundingType}, fallback to 'unknown'`);
      return 'unknown';
  }
}

/**
 * state 값을 CardState로 정규화
 */
function normalizeState(state: string): CardState {
  const validStates: CardState[] = ['VOTING', 'EVALUATING', 'ACTIVE', 'COMPLETE'];
  
  if (validStates.includes(state as CardState)) {
    return state as CardState;
  }
  
  console.warn(`Unknown state: ${state}, fallback to 'UNKNOWN'`);
  return 'UNKNOWN';
}

/**
 * D-Day 계산 (TODO: 구현 예정)
 * @param endsOn ISO 날짜 문자열
 * @returns 오늘 기준 남은 일수 (양수: 미래, 음수: 과거, 0: 오늘)
 */
function calculateDDay(endsOn: string): number {
  // TODO: 날짜 계산 로직 구현
  // const today = new Date();
  // const endDate = new Date(endsOn);
  // return Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return 0;
}

/**
 * DTO를 CardItem으로 변환
 */
export function mapFundingDtoToCardItem(input: {
  funding: FundingDto;
  cinema: CinemaDto;
}): CardItem {
  const { funding, cinema } = input;
  
  const kind = normalizeFundingType(funding.fundingType);
  const state = normalizeState(funding.state);
  
  // 공통 필드
  const baseCard = {
    id: funding.fundingId,
    kind,
    title: funding.title,
    videoName: funding.videoName,
    bannerUrl: funding.bannerUrl,
    cinema: {
      id: cinema.cinemaId,
      name: cinema.cinemaName,
      city: cinema.city,
      district: cinema.district,
    },
    favoriteCount: funding.favoriteCount,
    isLiked: funding.isLiked,
    state,
    endsOn: funding.fundingEndsOn,
    dDay: calculateDDay(funding.fundingEndsOn),
  };
  
  // kind별 분기 처리
  switch (kind) {
    case 'funding': {
      // 펀딩 카드: null 필드에 대한 기본값 정책 적용
      // TODO: 비즈니스 요구사항에 따라 기본값 정책 조정 필요
      const fundingCard: FundingCard = {
        ...baseCard,
        kind: 'funding',
        price: funding.price ?? 0, // TODO: null일 때 기본값 정책 확인 필요
        progressRate: funding.progressRate ?? 0, // TODO: null일 때 기본값 정책 확인 필요
        maxPeople: funding.maxPeople ?? 0, // TODO: null일 때 기본값 정책 확인 필요
        participantCount: funding.participantCount ?? 0, // TODO: null일 때 기본값 정책 확인 필요
        screenDate: funding.screenDate ?? '', // TODO: null일 때 기본값 정책 확인 필요
      };
      
      // 펀딩 카드에서 필수 필드가 null인 경우 경고
      if (funding.price === null || funding.progressRate === null || 
          funding.maxPeople === null || funding.participantCount === null ||
          funding.screenDate === null) {
        console.warn('Funding card has null values in required fields:', funding);
      }
      
      return fundingCard;
    }
    
    case 'vote': {
      const voteCard: VoteCard = {
        ...baseCard,
        kind: 'vote',
        // screenDate는 투표에서 undefined
      };
      return voteCard;
    }
    
    case 'unknown':
    default: {
      const unknownCard: UnknownCard = {
        ...baseCard,
        kind: 'unknown',
      };
      return unknownCard;
    }
  }
}

/**
 * DTO 배열을 CardItem 배열로 변환
 */
export function mapFundingDtoArrayToCardItems(
  items: Array<{ funding: FundingDto; cinema: CinemaDto }>
): CardItem[] {
  return items.map(mapFundingDtoToCardItem);
}

/*
테스트 변환 예시:

// 입력 (펀딩)
{
  "funding": {
    "fundingId": 101,
    "title": "뮤지컬 라이온킹 단체관람",
    "videoName": "뮤지컬 라이온킹",
    "bannerUrl": "https://example.com/lion-king.jpg",
    "state": "EVALUATING",
    "progressRate": 30,
    "fundingEndsOn": "2025-10-08",
    "screenDate": "2025-10-20",
    "price": 8000,
    "maxPeople": 50,
    "participantCount": 15,
    "favoriteCount": 232,
    "isLiked": true,
    "fundingType": "FUNDING"
  },
  "cinema": { "cinemaId": 1, "cinemaName": "CGV대학로", "city": "서울시", "district": "종로구" }
}

// 출력 (FundingCard)
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
  isLiked: true,
  dDay: 0 // TODO: 실제 계산 구현 후 정확한 값
}

// 입력 (투표)
{
  "funding": {
    "fundingId": 202,
    "title": "오페라의 유령 단체관람 투표",
    "videoName": "오페라의 유령",
    "bannerUrl": "https://example.com/phantom.jpg",
    "state": "VOTING",
    "progressRate": null,
    "fundingEndsOn": "2025-09-30",
    "screenDate": null,
    "price": null,
    "maxPeople": null,
    "participantCount": null,
    "favoriteCount": 120,
    "isLiked": false,
    "fundingType": "VOTE"
  },
  "cinema": { "cinemaId": 2, "cinemaName": "롯데시네마 건대입구", "city": "서울시", "district": "광진구" }
}

// 출력 (VoteCard)
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
  isLiked: false,
  dDay: 0 // TODO: 실제 계산 구현 후 정확한 값
}
*/