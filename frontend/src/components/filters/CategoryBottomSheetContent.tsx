'use client';

import React from 'react';
import { CategoryButtonGroup } from '@/components/filters/CategoryButtonGroup';
import { SubCategoryChips } from '@/components/filters/SubCategoryChips';
import type { CategoryValue, Category } from '@/constants/categories';

/**
 * 카테고리 선택 바텀시트 내용 컴포넌트
 *
 * 1차 카테고리와 2차 카테고리를 선택할 수 있는 UI를 제공합니다.
 */

interface CategoryBottomSheetContentProps {
  /** 현재 선택된 1차 카테고리 */
  selectedCategory: CategoryValue | null;
  /** 현재 선택된 2차 카테고리 ID */
  selectedSubCategory: number | null;
  /** 1차 카테고리 변경 핸들러 */
  onCategoryChange: (category: CategoryValue) => void;
  /** 2차 카테고리 변경 핸들러 */
  onSubCategoryChange: (subCategoryId: number | null) => void;
  /** 카테고리 목록 */
  categories: Category[];
}

export const CategoryBottomSheetContent: React.FC<CategoryBottomSheetContentProps> = ({ selectedCategory, selectedSubCategory, onCategoryChange, onSubCategoryChange, categories }) => {
  const selectedCat = categories.find((cat) => cat.value === selectedCategory);

  return (
    <div className="flex flex-col gap-8">
      {/* 1차 카테고리 선택 */}
      <CategoryButtonGroup items={categories} value={selectedCategory} onChange={onCategoryChange} variant="brand1" notchColor="bg-BG-1" />

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
          variant="brand1"
        />
      )}
    </div>
  );
};
