// TODO: 향후 CineCardHorizontal/CineCardVertical 컴포넌트를 CardItem 타입으로 업데이트해야 함
// TODO: cardItem.ts와 CineCard 컴포넌트의 타입 정의를 통일해야 함
// 현재는 CineCard 컴포넌트의 정확한 타입 정의를 사용하여 임시 호환성 확보

// CineCard 컴포넌트와 정확히 동일한 타입 정의 (cards 파일 수정 전까지 임시)
export type ListCardData = {
  funding: {
    fundingId: number;
    title: string;
    videoName: string;
    bannerUrl: string;
    state: string;
    progressRate: number; // DTO는 number | null이지만 카드는 number 기대
    fundingEndsOn: string;
    screenDate: string; // DTO는 string | null이지만 카드는 string 기대
    price: number; // DTO는 number | null이지만 카드는 number 기대
    maxPeople: number; // DTO는 number | null이지만 카드는 number 기대
    participantCount: number; // DTO는 number | null이지만 카드는 number 기대
    favoriteCount: number;
    isLiked: boolean;
    fundingType: 'FUNDING' | 'VOTE';
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
  };
};