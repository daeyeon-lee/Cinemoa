import React from 'react';
import { cn } from '@/lib/utils';

type PerforationLineProps = {
  thickness?: number;
  paddingX?: number;
  notchWidth?: number;
  notchHeight?: number;
  notchColorClass?: string;
};

const PerforationLine: React.FC<PerforationLineProps> = ({
  thickness = 2,

  notchWidth = 6,
  notchHeight = 2,
  notchColorClass = 'bg-slate-700',
}) => {
  return (
    <div className="px-3 relative w-full overflow-hidden" style={{ height: thickness }} aria-hidden="true">
      {/* 점선 배경 */}
      <div className="w-full bg-slate-800 border-t-2 border-dashed border-slate-700" style={{ height: thickness }} />
    </div>
  );
};

export { PerforationLine };
export type { PerforationLineProps };
