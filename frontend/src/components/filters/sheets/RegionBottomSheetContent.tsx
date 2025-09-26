'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface RegionBottomSheetContentProps {
  regions: string[];
  value: string[];
  onChange: (value: string[]) => void;
  variant?: 'brand1' | 'brand2';
}

export const RegionBottomSheetContent: React.FC<RegionBottomSheetContentProps> = ({ regions, value, onChange, variant = 'brand1' }) => {
  const handleToggle = (region: string) => {
    const isSelected = value.includes(region);
    if (isSelected) {
      onChange(value.filter((r) => r !== region));
    } else {
      onChange([...value, region]);
    }
  };

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-2.5">
      {regions.map((region) => {
        const isSelected = value.includes(region);
        return (
          <Button
            key={region}
            variant={isSelected ? variant : 'tertiary'}
            size="sm"
            onClick={() => handleToggle(region)}
            className={cn('justify-start text-left px-2 py-1', isSelected && 'text-primary')}
            textSize="sm"
          >
            {region}
          </Button>
        );
      })}
    </div>
  );
};
