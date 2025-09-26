import React from 'react';
import { CategoryButton } from '@/components/buttons/CategoryButton';
import type { Category, CategoryValue } from '@/constants/categories';
import { ComponentType } from 'react';

interface CategoryItem {
  label: string;
  icon: ComponentType<any> | null;
  value: string;
}

interface CategoryButtonGroupProps {
  items: Category[];
  value: CategoryValue | null;
  onChange: (value: CategoryValue) => void;
  variant?: 'brand1' | 'brand2';
  notchColor?: string;
  uniformHeight?: boolean;
  allowWrap?: boolean;
}

const CategoryButtonGroup: React.FC<CategoryButtonGroupProps> = ({ items, value, onChange, variant = 'brand1', notchColor, uniformHeight = false, allowWrap = false }) => {
  const allButton = items.find((item) => item.value === 'all');
  const otherButtons = items.filter((item) => item.value !== 'all');
  const page = variant === 'brand2' ? 'vote' : 'category';

  return (
    <div className={`flex items-center gap-1 self-stretch ${allowWrap ? 'flex-wrap' : ''}`}>
      {/* 전체 버튼 */}
      {allButton && (
        <CategoryButton
          selected={value === allButton.value}
          onClick={() => onChange(allButton.value as CategoryValue)}
          page={page}
          categoryValue={allButton.value}
          showNotches={false}
          uniformHeight={uniformHeight}
          className="flex-none"
          notchColor={notchColor}
        >
          {allButton.label}
        </CategoryButton>
      )}

      {/* 나머지 버튼들 */}
      {otherButtons.map((item) => (
        <div key={item.value} className={allowWrap ? "flex-none" : "flex-1 basis-0 min-w-0"}>
          <CategoryButton
            icon={item.icon}
            selected={value === item.value}
            onClick={() => onChange(item.value as CategoryValue)}
            page={page}
            categoryValue={item.value}
            uniformHeight={uniformHeight}
            className={allowWrap ? "min-w-[80px]" : "w-full"}
            notchColor={notchColor}
          >
            <div className="truncate">{item.label}</div>
          </CategoryButton>
        </div>
      ))}
    </div>
  );
};

export { CategoryButtonGroup };
export type { CategoryItem };
