'use client';

import { Button } from '@/components/ui/button';

export interface FilterOption<T = string | undefined> {
  value: T;
  label: string;
}

interface FilterButtonGroupProps<T = string | undefined> {
  options: FilterOption<T>[];
  selectedValue: T;
  onValueChange: (value: T) => void;
  className?: string;
}

export default function FilterButtonGroup<T = string | undefined>({
  options,
  selectedValue,
  onValueChange,
  className = '',
}: FilterButtonGroupProps<T>) {
  return (
    <div className={`flex gap-2 ${className}`}>
      {options.map((option, index) => (
        <Button
          key={option.value !== undefined ? String(option.value) : `all-${index}`}
          variant={selectedValue === option.value ? 'brand1' : 'secondary'}
          size="sm"
          className={`p3-b rounded-[15px] ${
            selectedValue === option.value
              ? 'bg-red-500 text-slate-300'
              : 'bg-slate-800 text-slate-400'
          }`}
          onClick={() => onValueChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
