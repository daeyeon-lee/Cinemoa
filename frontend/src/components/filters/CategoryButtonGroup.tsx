import React from 'react';
import { CategoryButton } from '@/components/buttons/CategoryButton';
import type { Category } from '@/constants/categories';
import { ComponentType } from 'react';

interface CategoryItem {
  label: string;
  icon: ComponentType<any> | null;
  value: string;
}

interface CategoryButtonGroupProps {
  items: Category[];
  value: string | null;
  onChange: (value: string) => void;
  variant?: 'brand1' | 'brand2';
}

const CategoryButtonGroup: React.FC<CategoryButtonGroupProps> = ({ items, value, onChange, variant = 'brand1' }) => {
  const allButton = items.find((item) => item.value === 'all');
  const otherButtons = items.filter((item) => item.value !== 'all');
  const page = variant === 'brand2' ? 'vote' : 'category';

  return (
    <div className="flex items-center gap-1 self-stretch">
      {/* 전체 버튼 */}
      {allButton && (
        <CategoryButton
          selected={value === allButton.value}
          onClick={() => onChange(allButton.value)}
          page={page}
          categoryValue={allButton.value}
          showNotches={false}
          className="flex-none"
        >
          {allButton.label}
        </CategoryButton>
      )}

      {/* 나머지 버튼들 */}
      {otherButtons.map((item) => (
        <div key={item.value} className="flex-1 basis-0 min-w-0">
          <CategoryButton
            icon={item.icon}
            selected={value === item.value}
            onClick={() => onChange(item.value)}
            page={page}
            categoryValue={item.value}
            className="w-full"
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
