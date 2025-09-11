import React from 'react';
import { Media } from '../primitives/Media';
import { MovieInfo } from '../blocks/MovieInfo';
import { FundingData, VoteData } from '../CineCardVertical';
import { HeartIcon } from '../../icons/HeartIcon';

type HorizontalLeftProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  formatRegion?: (region: string) => string;
  formatDate?: (timestamp: number) => string;
};

const HorizontalLeft: React.FC<HorizontalLeftProps> = ({
  data,
  loadingState = 'ready',
  formatRegion,
  formatDate
}) => {
  const isFunding = data.type === 'funding';

  return (
    <div className="flex-1 p-3 flex justify-start items-center gap-3">
      <div className="w-16 h-24 relative bg-slate-600 rounded overflow-hidden">
        <Media
          src={data.funding?.bannerUrl || data.vote?.bannerUrl || ''}
          alt={data.screening.videoName}
          aspect="auto"
          height={96}
          rounded={false}
          loadingState={loadingState}
        />
        {!isFunding && (
          <div className="w-5 h-5 left-[2px] top-[2px] absolute inline-flex justify-start items-center gap-2">
            <div className="flex-1 h-5 relative overflow-hidden">
              <HeartIcon className="w-3.5 h-3 absolute left-[2.50px] top-[4.17px] outline outline-2 outline-offset-[-1px] outline-slate-50" />
            </div>
          </div>
        )}
      </div>
      <div className="flex-1">
        <MovieInfo
          title={data.funding?.title || data.vote?.title || ''}
          videoName={data.screening.videoName}
          screeningTitle={data.screening.screeningTitle}
          region={data.screening.region}
          screenStartsOn={data.screening.screenStartsOn}
          formatRegion={formatRegion}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
};

export { HorizontalLeft };
export type { HorizontalLeftProps };