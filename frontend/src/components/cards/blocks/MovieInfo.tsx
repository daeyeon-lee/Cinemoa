import React from 'react';
import { TagGroup } from '../primitives/TagGroup';

type MovieInfoProps = {
  title: string;
  videoName: string;
  screeningTitle: string;
  region: string;
  screenStartsOn: number;
  formatRegion?: (region: string) => string;
  formatDate?: (timestamp: number) => string;
};

const MovieInfo: React.FC<MovieInfoProps> = ({ title, videoName, screeningTitle, region, screenStartsOn, formatRegion, formatDate }) => {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-slate-50 text-sm font-semibold font-['Pretendard'] leading-tight">{videoName}</div>
      <TagGroup region={region} date={screenStartsOn.toString()} formatRegion={formatRegion} formatDate={formatDate ? (date: string) => formatDate(parseInt(date)) : undefined} />
      <div className="text-slate-300 text-xs font-normal font-['Pretendard'] leading-none">{screeningTitle}</div>
    </div>
  );
};

export { MovieInfo };
export type { MovieInfoProps };
