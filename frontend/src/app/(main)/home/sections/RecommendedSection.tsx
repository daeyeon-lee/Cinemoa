'use client';

import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ApiSearchItem } from '@/types/searchApi';

/**
 * 추천 상영회 섹션 컴포넌트
 *
 * 사용자 맞춤 추천 상영회들을 표시합니다.
 * 세로 카드를 가로 스크롤로 배치하며, 기본 4개까지 보여주고 그 이후는 가로 스크롤로 확인할 수 있습니다.
 */
interface RecommendedSectionProps {
  /** 섹션 제목 */
  title: string;
  /** 표시할 카드 아이템 목록 (최대 8개) */
  items: ApiSearchItem[];
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 더보기 버튼 클릭 핸들러 (선택사항) */
  onMoreClick?: () => void;
  /** 카드 클릭 핸들러 */
  onCardClick?: (fundingId: number) => void;
}

/**
 * 추천 상영회 섹션
 * 세로 카드를 가로 스크롤로 배치하되, 기본 4개까지 보여주고 그 이후는 가로 스크롤 가능
 */
export function RecommendedSection({ title, items, loading = false, onMoreClick, onCardClick }: RecommendedSectionProps) {
  return (
    <div>
      {/* 섹션 헤더: 제목 (더보기 버튼은 선택사항) */}
      <div className="mb-4">
        <h2 className="text-h5-b">{title}</h2>
      </div>

      {/* Desktop: 카드를 절반씩 나누어 세로로 쌓기 - 동시 스크롤 (lg 이상) */}
      <div className="hidden lg:block">
        <HorizontalScroller>
          <div className="flex flex-col gap-8">
            {/* 첫 번째 그룹 (절반) */}
            <div className="flex gap-2">
              {items.slice(0, Math.ceil(items.length / 2)).map((item, index) => (
                <div key={item.funding.fundingId || index} className="w-[172px]">
                  <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                </div>
              ))}
            </div>

            {/* 두 번째 그룹 (나머지 절반) */}
            <div className="flex gap-2">
              {items.slice(Math.ceil(items.length / 2)).map((item, index) => (
                <div key={item.funding.fundingId || index} className="w-[172px]">
                  <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
                </div>
              ))}
            </div>
          </div>
        </HorizontalScroller>
      </div>

      {/* Mobile/Tablet: 1줄 가로 스크롤 (lg 미만) */}
      <div className="lg:hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2" style={{ width: `${items.length * 180}px` }}>
            {items.map((item, index) => (
              <div key={item.funding.fundingId || index} className="w-[172px] flex-shrink-0">
                <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
