'use client';

import { CineCardHorizontal } from '@/components/cards/CineCardHorizontal';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ApiSearchItem } from '@/types/searchApi';

/**
 * 인기 상영회 섹션 컴포넌트
 *
 * 좋아요, 참여자 수 등을 종합한 인기 상영회들을 표시합니다.
 * 데스크톱에서는 8개의 가로 카드를 세로로 쌓아 배치하고,
 * 모바일에서는 4x2 그리드로 반응형 배치하여 가로 스크롤을 제공합니다.
 */
interface PopularSectionProps {
  /** 섹션 제목 */
  title: string;
  /** 표시할 카드 아이템 목록 (최대 8개) */
  items: ApiSearchItem[];
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 더보기 버튼 클릭 핸들러 */
  onMoreClick?: () => void;
  /** 카드 클릭 핸들러 */
  onCardClick?: (fundingId: number) => void;
}

/**
 * 인기 상영회 섹션
 * 반응형 레이아웃으로 데스크톱에서는 세로 스택, 모바일에서는 4x2 그리드
 */
export function PopularSection({ title, items, loading = false, onMoreClick, onCardClick }: PopularSectionProps) {
  return (
    <div className="h-full">
      {/* 섹션 헤더: 제목과 더보기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h5-b">{title}</h2>
        {/* {onMoreClick && (
          <button onClick={onMoreClick} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
            더보기 →
          </button>
        )} */}
      </div>

      {/* 반응형 카드 컨테이너 */}
      <div className="h-full">
        {/* 데스크톱: 세로 스택 (md 이상) */}
        <div className="hidden lg:block h-full">
          <div className="space-y-5 h-full">
            {items.map((item, index) => (
              <div key={item.funding.fundingId || index} className="w-full flex items-start">
                <div className="text-Brand2-Primary text-2xl font-normal font-['LED_Counter_7'] leading-loose flex-shrink-0">{index + 1}</div>
                <div className="flex-1">
                  <CineCardHorizontal data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 모바일: 1-4위, 5-8위 그룹으로 가로 스크롤 (md 미만) */}
        <div className="block md:hidden">
          <HorizontalScroller className="w-full">
            {/* 1-4위 그룹 */}
            <div className="min-w-80 max-w-96 mr-4">
              <div className="space-y-3">
                {items.slice(0, 4).map((item, index) => (
                  <div key={item.funding.fundingId || index} className="flex items-center gap-2">
                    <div className="text-Brand2-Primary text-base font-normal font-['LED_Counter_7'] leading-loose flex-shrink-0 w-4 text-center">{index + 1}</div>
                    <div className="flex-1 min-w-0">
                      <CineCardHorizontal data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 5-8위 그룹 */}
            <div className="min-w-80 max-w-96">
              <div className="space-y-3">
                {items.slice(4, 8).map((item, index) => (
                  <div key={item.funding.fundingId || index} className="flex items-center gap-2">
                    <div className="text-Brand2-Primary text-base font-normal font-['LED_Counter_7'] leading-loose flex-shrink-0 w-4 text-center">{index + 5}</div>
                    <div className="flex-1 min-w-0">
                      <CineCardHorizontal data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </HorizontalScroller>
        </div>
      </div>
    </div>
  );
}
