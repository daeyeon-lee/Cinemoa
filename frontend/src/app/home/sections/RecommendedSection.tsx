'use client';

import { CineCardVertical } from '@/components/cards/CineCardVertical';
import HorizontalScroller from '@/components/containers/HorizontalScroller';
import type { ListCardData } from '../types/listCardData';

/**
 * 추천 상영회 섹션 컴포넌트
 *
 * 사용자 맞춤 추천 상영회들을 표시합니다.
 * 8개의 세로 카드를 4x2 그리드로 배치하며, 컨테이너 가로 크기를 넘어가면 가로 스크롤로 확인할 수 있습니다.
 */
interface RecommendedSectionProps {
  /** 섹션 제목 */
  title: string;
  /** 표시할 카드 아이템 목록 (최대 8개) */
  items: ListCardData[];
  /** 로딩 상태 여부 */
  loading?: boolean;
  /** 더보기 버튼 클릭 핸들러 (선택사항) */
  onMoreClick?: () => void;
}

/**
 * 추천 상영회 섹션
 * 세로 카드를 2줄 그리드로 배치하되, 넘치는 내용은 가로 스크롤 가능
 */
export function RecommendedSection({ title, items, loading = false, onMoreClick }: RecommendedSectionProps) {
  return (
    <div>
      {/* 섹션 헤더: 제목 (더보기 버튼은 선택사항) */}
      <div className="mb-4">
        <h2 className="text-h5-b">{title}</h2>
        {onMoreClick && (
          <button onClick={onMoreClick} className="text-p3 text-secondary hover:text-slate-400 transition-colors">
            더보기 →
          </button>
        )}
      </div>

      {/* Desktop: 카드를 절반씩 나누어 세로로 쌓기 - 동시 스크롤 */}
      <div className="hidden md:block">
        <HorizontalScroller className="">
          <div className="flex flex-col gap-4">
            {/* 첫 번째 그룹 (절반) */}
            <div className="flex gap-2">
              {items.slice(0, Math.ceil(items.length / 2)).map((item, index) => (
                <div key={item.funding.fundingId || index} className="w-[172px] flex-shrink-0">
                  <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} />
                </div>
              ))}
            </div>

            {/* 두 번째 그룹 (나머지 절반) */}
            <div className="flex gap-2">
              {items.slice(Math.ceil(items.length / 2)).map((item, index) => (
                <div key={item.funding.fundingId || index} className="w-[172px] flex-shrink-0">
                  <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} />
                </div>
              ))}
            </div>
          </div>
        </HorizontalScroller>
      </div>

      {/* Mobile: 1줄 가로 스크롤 */}
      <div className="md:hidden">
        <HorizontalScroller className="w-full">
          {items.map((item, index) => (
            <div key={item.funding.fundingId || index} className="w-[172px] flex-shrink-0">
              <CineCardVertical data={item} loadingState={loading ? 'loading' : 'ready'} />
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </div>
  );
}
