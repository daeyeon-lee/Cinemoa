'use client';

import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ApiSearchItem } from '@/types/searchApi';

/**
 * 최근 본 상영회 섹션 컴포넌트
 *
 * 사용자가 최근에 조회한 상영회들을 표시합니다.
 * 6개의 세로 카드를 가로로 배치합니다.
 *
 * 주의: 이 컴포넌트는 레이아웃 클래스(col-span-12)를 포함하지 않습니다.
 * 부모 컴포넌트에서 적절한 그리드 배치를 설정해야 합니다.
 */
interface RecentlyViewedSectionProps {
  /** 섹션 제목 */
  title: string;
  /** 표시할 카드 아이템 목록 (최대 6개) */
  items: ApiSearchItem[];
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 더보기 버튼 클릭 핸들러 */
  onMoreClick?: () => void;
  /** 카드 클릭 핸들러 */
  onCardClick?: (fundingId: number) => void;
  /** 좋아요 버튼 클릭 핸들러 */
  onVoteClick?: (fundingId: number) => void;
}

/**
 * 최근 본 상영회 섹션
 * 6개의 세로 카드를 그리드로 배치
 */
export function RecentlyViewedSection({ title, items, loading = false, onMoreClick, onCardClick, onVoteClick }: RecentlyViewedSectionProps) {
  // 데이터가 없고 로딩 중이 아닐 때는 섹션을 렌더링하지 않음
  if (!loading && (!items || items.length === 0)) {
    return null;
  }

  // recentViewStore에서 이미 최근 방문 순서대로 정렬되어 있으므로 그대로 사용
  // recentViewIds: [32, 29, 52, 19] → 리스트: 32 → 29 → 52 → 19 순으로 표시 (맨 앞이 최신)

  return (
    <div>
      {/* 섹션 헤더: 제목과 더보기 버튼 */}
      <div className="flex items-center justify-between mb-4 ">
        <h2 className="text-h5-b">{title}</h2>
        {onMoreClick && (
          <button onClick={onMoreClick} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
            더보기 →
          </button>
        )}
      </div>

      {/* 카드 그리드: 모든 세로 카드를 가로 스크롤로 배치 (리스트에 들어온 순서대로) */}
      <HorizontalScroller className="w-full">
        {items.map((item, index) => (
          <div key={item.funding.fundingId || index} className="w-[172px] flex-shrink-0 h-[400px]">
                <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} onCardClick={onCardClick} onVoteClick={onVoteClick} />
          </div>
        ))}
      </HorizontalScroller>
    </div>
  );
}
