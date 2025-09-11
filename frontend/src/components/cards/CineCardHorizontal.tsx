import React from 'react';
import { HorizontalLeft } from './sections/HorizontalLeft';
import { HorizontalRight } from './sections/HorizontalRight';
import { PerforationLine } from './primitives/PerforationLine';
import { FundingData, VoteData, CineCardProps } from './CineCardVertical';

const CineCardHorizontal: React.FC<CineCardProps> = ({ 
  data, 
  loadingState = 'ready', 
  onVoteClick, 
  onCardClick 
}) => {
  const formatRegion = (region: string) => {
    const regionMap: { [key: string]: string } = {
      seoul: '서울',
      busan: '부산',
      incheon: '인천',
      daegu: '대구',
      daejeon: '대전',
      gwangju: '광주',
      ulsan: '울산',
      sejong: '세종',
      gyeonggi: '경기',
      gangwon: '강원',
      chungbuk: '충북',
      chungnam: '충남',
      jeonbuk: '전북',
      jeonnam: '전남',
      gyeongbuk: '경북',
      gyeongnam: '경남',
      jeju: '제주',
    };
    return regionMap[region] || region;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const handleCardClick = () => {
    if (onCardClick) {
      const id = data.type === 'funding' 
        ? (data as FundingData).funding.fundingId 
        : (data as VoteData).vote.voteId;
      onCardClick(id);
    }
  };

  return (
    <div 
      className="w-96 inline-flex justify-center items-start cursor-pointer hover:bg-slate-800/50 transition-colors rounded-lg"
      onClick={handleCardClick}
    >
      <HorizontalLeft
        data={data}
        loadingState={loadingState}
        formatRegion={formatRegion}
        formatDate={formatDate}
      />
      <div className="self-stretch">
        <PerforationLine orientation="vertical" />
      </div>
      <HorizontalRight
        data={data}
        loadingState={loadingState}
        onVoteClick={onVoteClick}
      />
    </div>
  );
};

export { CineCardHorizontal };
export type { CineCardProps, FundingData, VoteData };