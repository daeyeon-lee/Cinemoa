import React from 'react';

type TagGroupProps = {
  region: string;
  date: string;
  formatRegion?: (region: string) => string;
  formatDate?: (date: string) => string;
};

const TagGroup: React.FC<TagGroupProps> = ({ 
  region, 
  date, 
  formatRegion = (r) => r,
  formatDate = (d) => d 
}) => {
  return (
    <div className="flex gap-1">
      <div className="px-1.5 py-[3px] bg-slate-600 rounded-md flex justify-center items-center gap-2">
        <div className="text-slate-300 text-[10px] font-semibold font-['Pretendard'] leading-3">
          {formatRegion(region)}
        </div>
      </div>
      <div className="px-1.5 py-[3px] bg-slate-600 rounded-md flex justify-center items-center gap-2">
        <div className="text-slate-300 text-[10px] font-semibold font-['Pretendard'] leading-3">
          {formatDate(date)}
        </div>
      </div>
    </div>
  );
};

export { TagGroup };
export type { TagGroupProps };