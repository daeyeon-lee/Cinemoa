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
    <div className="flex flex-wrap gap-x-1.5 gap-y-2.5">
      {regions.map((region) => {
        const isSelected = value.includes(region);
        return (
          <Button
            key={region}
            variant={isSelected ? variant : 'outline'}
            size="sm"
            onClick={() => handleToggle(region)}
            className={cn('justify-start text-left px-3 py-2 text-p3-b text-tertiary', isSelected && 'text-primary')}
          >
            {region}
          </Button>
        );
      })}
    </div>
  );
};
