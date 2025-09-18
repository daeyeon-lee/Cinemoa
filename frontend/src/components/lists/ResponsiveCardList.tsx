import React from 'react';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import { CineCardHorizontal } from '@/components/cards/CineCardHorizontal';
import { Button } from '@/components/ui/button';
import type { ListCardData } from '@/components/cards/CineCardVertical';

/**
 * 카드 아이템 타입 (기존 ListCardData와 동일)
 */
type CardItem = ListCardData;

/**
 * ResponsiveCardList 컴포넌트의 props 타입
 */
interface ResponsiveCardListProps {
  /** 표시할 카드 아이템 목록 */
  items: CardItem[];
  /** 카드 표시 모드 */
  mode: 'funding' | 'vote' | 'search';
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 빈 목록 상태 여부 */
  empty?: boolean;
  /** 에러 상태 여부 */
  error?: boolean;
  /** 카드 클릭 핸들러 */
  onCardClick?: (id: number) => void;
  /** 투표/좋아요 버튼 클릭 핸들러 */
  onVoteClick?: (id: number) => void;
  /** 필터 초기화 핸들러 */
  onResetFilters?: () => void;
  /** 재시도 핸들러 */
  onRetry?: () => void;
}

/**
 * ResponsiveCardList 컴포넌트
 *
 * @description ListShell의 content 영역에서 카드 목록을 반응형으로 표시하는 컴포넌트입니다.
 * 데스크톱에서는 그리드 레이아웃의 세로형 카드를, 모바일에서는 가로형 카드를 사용합니다.
 *
 * @example
 * ```tsx
 * // TODO: 실제 카드 데이터로 교체 필요
 * <ResponsiveCardList
 *   items={cardItems}
 *   mode="funding"
 *   loading={isLoading}
 *   empty={items.length === 0}
 *   error={hasError}
 *   onCardClick={handleCardClick}
 *   onVoteClick={handleVoteClick}
 *   onResetFilters={handleResetFilters}
 *   onRetry={handleRetry}
 * />
 * ```
 *
 * @param props.items - 표시할 카드 아이템 목록
 * @param props.mode - 카드 표시 모드 (펀딩/투표/검색)
 * @param props.loading - 로딩 상태 여부
 * @param props.empty - 빈 목록 상태 여부
 * @param props.error - 에러 상태 여부
 * @param props.onCardClick - 카드 클릭 핸들러
 * @param props.onVoteClick - 투표/좋아요 클릭 핸들러
 * @param props.onResetFilters - 필터 초기화 핸들러
 * @param props.onRetry - 재시도 핸들러
 */
const ResponsiveCardList: React.FC<ResponsiveCardListProps> = ({
  items,
  mode,
  loading = false,
  empty = false,
  error = false,
  onCardClick,
  onVoteClick,
  onResetFilters,
  onRetry,
}) => {
  // 로딩 상태: 스켈레톤 카드 8개 표시 (개발 단계 UI 확인용)
  if (loading) {
    return (
      <div className="">
        {/* 데스크톱: 그리드 레이아웃 */}
        <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-x-2 gap-y-8">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={`skeleton-${index}`} style={{ width: 'clamp(172px, 20vw, 224px)' }}>
              <CineCardVertical
                data={{
                  funding: {
                    fundingId: index,
                    title: '',
                    bannerUrl: '',
                    state: '',
                    progressRate: 0,
                    fundingEndsOn: '',
                    screenDate: '',
                    price: 0,
                    maxPeople: 0,
                    participantCount: 0,
                    favoriteCount: 0,
                    isLiked: false,
                    fundingType: 'FUNDING',
                  },
                  cinema: {
                    cinemaId: 0,
                    cinemaName: '',
                    city: '',
                    district: '',
                  },
                }}
                loadingState="loading"
              />
            </div>
          ))}
        </div>

        {/* 모바일: 세로 스택 레이아웃 */}
        <div className="md:hidden space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <CineCardHorizontal
              key={`skeleton-mobile-${index}`}
              data={{
                funding: {
                  fundingId: index,
                  title: '',
                  bannerUrl: '',
                  state: '',
                  progressRate: 0,
                  fundingEndsOn: '',
                  screenDate: '',
                  price: 0,
                  maxPeople: 0,
                  participantCount: 0,
                  favoriteCount: 0,
                  isLiked: false,
                  fundingType: 'FUNDING',
                },
                cinema: {
                  cinemaId: 0,
                  cinemaName: '',
                  city: '',
                  district: '',
                },
              }}
              loadingState="loading"
            />
          ))}
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-slate-400 mb-4">불러오기 실패</p>
        <Button variant="outline" onClick={onRetry}>
          다시 시도
        </Button>
      </div>
    );
  }

  // 빈 목록 상태
  if (empty || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-slate-400 mb-4">조건을 완화하세요</p>
        <Button variant="outline" onClick={onResetFilters}>
          필터 초기화
        </Button>
      </div>
    );
  }

  // 정상 상태: 카드 목록 표시
  return (
    <div className="">
      {/* 데스크톱: 그리드 레이아웃 */}
      <div className="hidden md:grid grid-cols-[repeat(auto-fill,minmax(172px,1fr))] gap-x-2 gap-y-8">
        {items.map((item) => (
          <div key={item.funding.fundingId}>
            <CineCardVertical data={item} onCardClick={onCardClick} onVoteClick={onVoteClick} />
          </div>
        ))}
      </div>

      {/* 모바일: 가로형 카드 (full width) */}
      <div className="md:hidden space-y-2">
        {items.map((item) => (
          <div key={`mobile-${item.funding.fundingId}`} className="w-full">
            <CineCardHorizontal data={item} onCardClick={onCardClick} onVoteClick={onVoteClick} />
          </div>
        ))}
      </div>
    </div>
  );
};

export { ResponsiveCardList };
export type { CardItem };
