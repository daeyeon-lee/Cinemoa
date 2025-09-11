import React from 'react';
import { Media } from '../primitives/Media';
import { MovieInfo } from '../blocks/MovieInfo';
import { FundingData, VoteData } from '../CineCardVertical';

type VerticalTopProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  formatRegion?: (region: string) => string;
  formatDate?: (timestamp: number) => string;
};

const VerticalTop: React.FC<VerticalTopProps> = ({
  data,
  loadingState = 'ready',
  formatRegion,
  formatDate
}) => {
  return (
    <div className="flex flex-col gap-3">
      <Media
        src={data.funding?.bannerUrl || data.vote?.bannerUrl || ''}
        alt={data.screening.videoName}
        loadingState={loadingState}
      />
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
  );
};

export { VerticalTop };
export type { VerticalTopProps };