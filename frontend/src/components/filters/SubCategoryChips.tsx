import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 서브 카테고리 칩의 데이터 타입
 */
interface SubCategoryItem {
  /** 칩에 표시될 텍스트 */
  label: string;
  /** 서브 카테고리의 고유 식별값 (categoryId 또는 'all') */
  value: string;
}

/**
 * SubCategoryChips 컴포넌트의 props 타입
 */
interface SubCategoryChipsProps {
  /** 표시할 서브 카테고리 칩 목록 */
  items: SubCategoryItem[];
  /** 현재 선택된 서브 카테고리의 categoryId (단일 선택) */
  value: number | null;
  /** 서브 카테고리 선택 변경 시 호출되는 콜백 함수 */
  onChange: (value: number | null) => void;
  /** 서브 카테고리 표시 여부 (전체 선택 시 숨김) */
  visible?: boolean;
  /** 색상 variant (brand1: 빨간색, brand2: 청록색) */
  variant?: 'brand1' | 'brand2';
}

/**
 * SubCategoryChips 컴포넌트
 *
 * @description 2차 카테고리 선택을 위한 칩(chip) 그룹 컴포넌트입니다.
 * ListShell의 header 영역에서 사용되며, 단일 선택만 가능합니다.
 *
 * @example
 * ```tsx
 * // TODO: 실제 서브 카테고리 데이터로 교체 필요
 * const subCategories = [
 *   { label: '액션', value: 'action' },
 *   { label: '로맨스', value: 'romance' },
 *   { label: '코미디', value: 'comedy' }
 * ];
 *
 * <SubCategoryChips
 *   items={subCategories}
 *   value={selectedSubCategories}
 *   onChange={setSelectedSubCategories}
 * />
 * ```
 *
 * @param props.items - 표시할 서브 카테고리 칩 목록
 * @param props.value - 현재 선택된 서브 카테고리 값들
 * @param props.onChange - 서브 카테고리 선택 변경 핸들러
 */
const SubCategoryChips: React.FC<SubCategoryChipsProps> = ({ items, value, onChange, visible = true, variant = 'brand1' }) => {
  /**
   * 칩 선택을 처리하는 핸들러 (단일 선택)
   * @param itemValue - 선택할 아이템의 value (categoryId 문자열 또는 'all')
   */
  const handleSelect = (itemValue: string) => {
    if (itemValue === 'all') {
      // '전체' 선택 시 선택 해제
      onChange(null);
      return;
    }

    const categoryId = parseInt(itemValue);
    // 이미 선택된 경우 해제, 아니면 새로 선택
    const newValue = value === categoryId ? null : categoryId;
    onChange(newValue);
  };

  // 전체 선택 시 서브 카테고리 숨김
  if (!visible || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* 서브 카테고리 칩 목록 렌더링 */}
      {items.map((item) => {
        const isSelected =
          item.value === 'all'
            ? value === null // '전체'는 아무것도 선택되지 않았을 때 활성화
            : value === parseInt(item.value);

        return (
          <Button
            key={item.value}
            variant={isSelected ? variant : 'tertiary'}
            size="sm"
            textSize="sm"
            onClick={() => handleSelect(item.value)}
            className={cn('rounded-full px-4 py-2 h-auto transition-all', isSelected && 'text-primary')}
          >
            {item.label}
          </Button>
        );
      })}
    </div>
  );
};

export { SubCategoryChips };
export type { SubCategoryItem };
