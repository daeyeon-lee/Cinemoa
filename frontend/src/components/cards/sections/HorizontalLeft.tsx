import React from 'react';
import { Media } from '../primitives/Media';
import { FundingData, VoteData } from '../CineCardVertical';

type HorizontalLeftProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  formatLocation?: (city: string, district: string) => string;
  formatDate?: (dateString: string) => string;
};

const HorizontalLeft: React.FC<HorizontalLeftProps> = ({
  data,
  loadingState = 'ready',
  formatLocation,
  formatDate,
}) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  return (
    <div className="flex-1 p-3 flex justify-start items-center gap-3">
      <div className="w-16 h-24 relative bg-slate-600 rounded overflow-hidden">
        <Media
          src={data.funding.bannerUrl}
          alt={data.funding.title}
          aspect="auto"
          height={96}
          rounded={false}
          loadingState={loadingState}
        />
      </div>

      <div className="flex-1 space-y-2">
        {/* 프로젝트 제목 */}
        <h3 className="text-sm font-semibold text-slate-50 line-clamp-2 leading-tight">{data.funding.title}</h3>

        {/* 위치 및 날짜 정보 */}
        <div className="flex flex-wrap gap-1">
          <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
            {formatLocation
              ? formatLocation(data.cinema.city, data.cinema.district)
              : `${data.cinema.city} ${data.cinema.district}`}
          </span>
          {data.funding.screenDate && (
            <span className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
              {formatDate ? formatDate(data.funding.screenDate) : data.funding.screenDate}
            </span>
          )}
        </div>

        {/* 영화관 이름 */}
        <p className="text-xs text-slate-300 line-clamp-1">{data.cinema.cinemaName}</p>

        {/* 상태 정보 */}
        <div className="text-xs text-slate-400">
          {isFunding ? (
            <span>
              {data.funding.participantCount}/{data.funding.maxPeople}명 참여 • {data.funding.progressRate}%
            </span>
          ) : (
            <span>{data.funding.favoriteCount}명이 보고싶어해요</span>
          )}
        </div>
      </div>
    </div>
  );
};

export { HorizontalLeft };
export type { HorizontalLeftProps };
