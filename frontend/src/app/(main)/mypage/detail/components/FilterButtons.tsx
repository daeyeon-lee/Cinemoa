import React from 'react';
import { Button } from '@/components/ui/button';

type FilterType = 'funding' | 'vote' | 'ALL' | 'ON_PROGRESS' | 'CLOSE';

export interface FilterOption {
  key: FilterType;
  label: string;
}

interface FilterButtonsProps {
  filters: FilterOption[];
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const FilterButtons: React.FC<FilterButtonsProps> = ({ filters, currentFilter, onFilterChange }) => {
  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {filters.map((filterOption) => (
          <Button
            key={filterOption.key}
            variant={currentFilter === filterOption.key ? "brand1" : "secondary"}
            size="sm"
            className={`h-8 px-4 py-1 text-sm font-semibold rounded-2xl ${
              currentFilter === filterOption.key
                ? "bg-red-500 text-slate-300"
                : "bg-slate-800 text-slate-400"
            }`}
            onClick={() => onFilterChange(filterOption.key)}
          >
            {filterOption.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default FilterButtons;
