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
        {/* 데스크톱: 세로 스택 (lg 이상) */}
        <div className="hidden lg:block h-full">
          <div className="space-y-3.5 h-full">
            <div className="space-y-6 h-full">
              {items.slice(0, 6).map((item, index) => (
                <div key={item.funding.fundingId || index} className="w-full flex items-start">
                  <div className="text-Brand2-Primary text-2xl font-normal font-['LED_Counter_7'] leading-loose flex-shrink-0">{index + 1}</div>
                  <div className="flex-1">
                    <CineCardHorizontal data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모바일/태블릿: 세로로 3개씩 + 가로 스크롤 (lg 미만) */}
          <div className="block lg:hidden">
            <div className="flex gap-8">
              <div className="flex gap-4">
                {/* 첫 번째 그룹 (1-3위) */}
                <div className="w-[300px] flex-shrink-0">
                  <div className="space-y-3">
                    {items.slice(0, 3).map((item, index) => (
                      <div key={item.funding.fundingId || index} className="flex items-center gap-2">
                        <div className="text-Brand2-Primary text-base font-normal font-['LED_Counter_7'] leading-loose flex-shrink-0 w-4 text-center">{index + 1}</div>
                        <div className="flex-1 min-w-0">
                          <CineCardHorizontal data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 두 번째 그룹 (4-6위) - 6개 이상일 때만 표시 */}
                {items.length > 3 && (
                  <div className="w-[300px] flex-shrink-0">
                    <div className="space-y-3">
                      {items.slice(3, 6).map((item, index) => (
                        <div key={item.funding.fundingId || index} className="flex items-center gap-2">
                          <div className="text-Brand2-Primary text-base font-normal font-['LED_Counter_7'] leading-loose flex-shrink-0 w-4 text-center">{index + 4}</div>
                          <div className="flex-1 min-w-0">
                            <CineCardHorizontal data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
