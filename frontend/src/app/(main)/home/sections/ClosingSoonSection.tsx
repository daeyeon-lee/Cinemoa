'use client';

import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ApiSearchItem } from '@/types/searchApi';

/**
 * 종료 임박 상영회 섹션 컴포넌트
 *
 * 펀딩 마감일이 임박한 상영회들을 표시합니다.
 * 모든 세로 카드를 가로로 배치하며, 컨테이너를 넘어가는 카드는 가로 스크롤로 확인할 수 있습니다.
 */
interface ClosingSoonSectionProps {
  /** 섹션 제목 */
  title: string;
  /** 표시할 카드 아이템 목록 */
  items: ApiSearchItem[];
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 더보기 버튼 클릭 핸들러 */
  onMoreClick?: () => void;
  /** 카드 클릭 핸들러 */
  onCardClick?: (fundingId: number) => void;
}

/**
 * 종료 임박 상영회 섹션
 * 모든 세로 카드를 가로 스크롤 가능한 형태로 배치
 */
export function ClosingSoonSection({ title, items, loading = false, onMoreClick, onCardClick }: ClosingSoonSectionProps) {
  return (
    <div>
      {/* 섹션 헤더: 제목과 더보기 버튼 */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-h5-b">{title}</h2>
        {/* {onMoreClick && (
          <button onClick={onMoreClick} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
            더보기 →
          </button>
        )} */}
      </div>

      {/* 가로 스크롤 - 기본 4개까지 보여주고 그 이후는 스크롤 */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2">
          {items.map((item, index) => (
            <div key={item.funding.fundingId || index} className="w-[172px] flex-shrink-0">
              <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
