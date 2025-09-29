import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import type { SortBy } from '@/types/searchApi';
/**
 * SortBar 컴포넌트의 props 타입
 */
interface SortBarProps {
  /** 현재 선택된 정렬 기준 */
  sortBy: SortBy;
  /** 정렬 기준 변경 시 호출되는 콜백 함수 */
  onSortChange: (value: SortBy) => void;
  /** 마감된 항목 표시 여부 */
  isClosed: boolean;
  /** 마감된 항목 표시 여부 변경 시 호출되는 콜백 함수 */
  onIsClosedChange: (checked: boolean) => void;
}

/**
 * SortBar 컴포넌트
 *
 * @description ListShell의 우측 콘텐츠 영역 상단에 위치하는 정렬 및 필터 바입니다.
 * 정렬 기준 선택과 마감된 항목 표시 여부를 제어할 수 있습니다.
 *
 * @example
 * ```tsx
 * // TODO: 실제 정렬 옵션 데이터로 교체 필요
 * <SortBar
 *   sortBy={sortOption}
 *   onSortChange={setSortOption}
 *   isClosed={showClosed}
 *   onIsClosedChange={setShowClosed}
 * />
 * ```
 *
 * @param props.sortBy - 현재 선택된 정렬 기준
 * @param props.onSortChange - 정렬 기준 변경 핸들러
 * @param props.isClosed - 마감된 항목 표시 여부
 * @param props.onIsClosedChange - 마감된 항목 표시 여부 변경 핸들러
 */
const SortBar: React.FC<SortBarProps> = ({ sortBy, onSortChange, isClosed, onIsClosedChange }) => {
  // API 쿼리 파라미터와 일치하는 정렬 옵션
  const sortOptions: { value: SortBy; label: string }[] = [
    { value: 'LATEST', label: '최신순' },
    { value: 'POPULAR', label: '조회도순' },
    { value: 'RECOMMENDED', label: '인기순' },
  ];

  return (
    <div className="flex items-center justify-between pb-3">
      {/* 좌측: 정렬 기준 선택 */}
      <div className="flex items-center gap-1">
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-32 h-9">
            <SelectValue placeholder="정렬 선택" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 우측: 종료된 상영회 안보기 체크박스 */}
      {/* <div className="flex items-center space-x-2">
        <Input type="checkbox" id="show-closed" checked={isClosed} onChange={(e) => onIsClosedChange(e.target.checked)} className="w-4 h-4 bg-slate-800" />
        <label htmlFor="show-closed" className="text-sm text-secondary cursor-pointer">
          종료된 상영회 포함
        </label>
      </div> */}
    </div>
  );
};

export { SortBar };
