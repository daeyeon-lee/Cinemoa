import React, { useMemo } from 'react';
import { CategoryButtonGroup, type CategoryItem } from './CategoryButtonGroup';
import { SubCategoryChips, type SubCategoryItem } from './SubCategoryChips';
import type { Category, CategoryValue } from '@/constants/categories';
import { getCategoryItems } from '@/constants/categories';

interface CategorySelectSectionProps {
  categories: Category[];
  selectedCategory: CategoryValue | null;
  onCategoryChange: (value: CategoryValue | null) => void;
  selectedSubCategory: number | null;
  onSubCategoryChange: (value: number | null) => void;
  variant?: 'brand1' | 'brand2';
}

// 이제 constants/categories.ts에서 가져오므로 제거

const CategorySelectSection: React.FC<CategorySelectSectionProps> = ({ categories, selectedCategory, onCategoryChange, selectedSubCategory, onSubCategoryChange, variant = 'brand1' }) => {
  // useMemo로 서브카테고리 목록을 메모이제이션하여 재렌더링 방지
  const currentSubCategories = useMemo(() => {
    if (!selectedCategory || selectedCategory === 'all') {
      return [];
    }

    const items = getCategoryItems(selectedCategory as any);
    const subCategoryItems: SubCategoryItem[] = [
      { label: '전체', value: 'all' }, // 전체 옵션 추가
      ...items.map((item) => ({
        label: item.categoryName,
        value: item.categoryId.toString(),
      })),
    ];

    return subCategoryItems;
  }, [selectedCategory]);

  const handleCategoryChange = (newCategory: CategoryValue) => {
    onCategoryChange(newCategory);
    onSubCategoryChange(null); // 2차 카테고리 초기화
  };

  return (
    <div className="space-y-3">
      <h1 className="text-h4-b pb-2 border-b border-stroke-3">카테고리</h1>
      <CategoryButtonGroup items={categories} value={selectedCategory} onChange={handleCategoryChange} variant={variant} />
      <SubCategoryChips items={currentSubCategories} value={selectedSubCategory} onChange={onSubCategoryChange} visible={selectedCategory !== 'all'} variant={variant} />
    </div>
  );
};

export { CategorySelectSection };
