import React from 'react';
import { Media } from '../primitives/Media';
import { ApiSearchItem } from '@/types/searchApi';

type HorizontalLeftProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  formatDate: (dateString: string) => string;
};

const HorizontalLeft: React.FC<HorizontalLeftProps> = ({ data, loadingState = 'ready', formatDate }) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  return (
    <div className="flex-1 min-w-0 p-3 flex justify-start items-center gap-3 bg-BG-1 rounded-xl">
      <div className="w-16 relative rounded overflow-hidden">
        <Media src={data.funding.bannerUrl} alt={data.funding.title} aspect="7/10" height={96} rounded={false} loadingState={loadingState} />
      </div>
      {/* 영화 정보 */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* 영화 제목 - 2줄 */}
        <h3 className="text-sm font-semibold text-slate-50 line-clamp-2 leading-tight min-h-[2.5rem]">{data.funding.videoName}</h3>

        {/* 위치 및 날짜 정보 */}
        <div className="flex flex-wrap gap-1">
          <span className="p-1 bg-slate-600 text-slate-300 text-caption2 rounded">{data.cinema.district}</span>
          <span className="p-1 bg-slate-600 text-slate-300 text-caption2 rounded">{formatDate(isFunding ? data.funding.screenDate : data.funding.fundingEndsOn)}</span>
        </div>

        {/* 프로젝트 제목 - 1줄 */}
        <p className="text-p3 text-slate-300 line-clamp-1 truncate">{data.funding.title}</p>
      </div>
    </div>
  );
};

export { HorizontalLeft };
export type { HorizontalLeftProps };
