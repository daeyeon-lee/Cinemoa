'use client';

import React from 'react';
import { CategoryButtonGroup } from '@/components/filters/CategoryButtonGroup';
import { SubCategoryChips } from '@/components/filters/SubCategoryChips';
import type { CategoryValue, Category } from '@/constants/categories';

/**
 * 카테고리 선택 바텀시트 내용 컴포넌트
 *
 * 1차 카테고리는 단일 선택, 2차 카테고리는 다중 선택이 가능한 UI를 제공합니다.
 */

interface CategoryBottomSheetContentProps {
  /** 현재 선택된 1차 카테고리 */
  selectedCategory: CategoryValue | null;
  /** 현재 선택된 2차 카테고리 ID들 (다중 선택) */
  selectedSubCategory: number[];
  /** 1차 카테고리 변경 핸들러 */
  onCategoryChange: (category: CategoryValue) => void;
  /** 2차 카테고리 변경 핸들러 (다중 선택) */
  onSubCategoryChange: (subCategoryIds: number[]) => void;
  /** 카테고리 목록 */
  categories: Category[];
  /** 색상 variant */
  variant?: 'brand1' | 'brand2';
}

export const CategoryBottomSheetContent: React.FC<CategoryBottomSheetContentProps> = ({ selectedCategory, selectedSubCategory, onCategoryChange, onSubCategoryChange, categories, variant = 'brand1' }) => {
  const selectedCat = categories.find((cat) => cat.value === selectedCategory);

  return (
    <div className="flex flex-col gap-8">
      {/* 1차 카테고리 선택 */}
      <div className="w-full overflow-x-auto scrollbar-hide">
        <CategoryButtonGroup items={categories} value={selectedCategory} onChange={onCategoryChange} variant={variant} uniformHeight={true} notchColor="bg-BG-1" allowWrap={false} />
      </div>

      {/* 2차 카테고리 선택 - 1차 카테고리가 선택되었을 때만 표시 */}
      {selectedCategory && selectedCategory !== 'all' && (
        <SubCategoryChips
          items={(() => {
            const subItems =
              selectedCat?.items?.map((item) => ({
                label: item.categoryName,
                value: item.categoryId.toString(),
              })) || [];
            return [{ label: '전체', value: 'all' }, ...subItems];
          })()}
          value={selectedSubCategory}
          onChange={onSubCategoryChange}
          variant={variant}
        />
      )}
    </div>
  );
};
