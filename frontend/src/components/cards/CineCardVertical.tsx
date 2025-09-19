import React from 'react';
import { Media } from './primitives/Media';
import { BarcodeDecor } from './primitives/BarcodeDecor';
import { PerforationLine } from './primitives/PerforationLine';
import { VoteInfo } from './blocks/VoteInfo';
import { FundingInfo } from './blocks/FundingInfo';
import { HeartIcon } from '@/component/icon/heartIcon';

// 목록 API에 맞춘 데이터 타입 정의 (펀딩/투표 공통)
type ListCardData = {
  funding: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    state: string;
    progressRate: number;
    fundingEndsOn: string;
    screenDate: string;
    price: number;
    maxPeople: number;
    participantCount: number;
    favoriteCount: number;
    isLiked: boolean;
    fundingType: 'FUNDING' | 'VOTE';
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
  };
};

// 호환성을 위한 타입 별칭
type FundingData = ListCardData;
type VoteData = ListCardData;

type CineCardProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  onCardClick?: (id: number) => void;
  onVoteClick?: (id: number) => void;
  showStateTag?: boolean;
  stateTagClassName?: string;
  getStateBadgeInfo?: (state: string, fundingType: 'FUNDING' | 'VOTE') => { text: string; className: string };
};

const CineCardVertical: React.FC<CineCardProps> = ({ data, loadingState = 'ready', onVoteClick, onCardClick, showStateTag = false, stateTagClassName = '', getStateBadgeInfo }) => {
  const isFunding = data.funding.fundingType === 'FUNDING';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatLocation = (city: string, district: string) => {
    return `${city} ${district}`;
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(data.funding.fundingId);
    }
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVoteClick) {
      onVoteClick(data.funding.fundingId);
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="w-full h-[300px] bg-slate-700 animate-pulse rounded-xl">
        <div className="p-4 space-y-2">
          <div className="h-4 bg-slate-600 rounded w-3/4"></div>
          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
          <div className="h-20 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="w-full h-[300px] bg-slate-700 rounded-xl flex items-center justify-center">
        <p className="text-slate-400">카드를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[300px] bg-slate-800 rounded-xl cursor-pointer transition-transform hover:scale-[1.02]" onClick={handleCardClick}>
      <div className="p-[11px] space-y-[7px] h-full flex flex-col">
        <div className="flex gap-[5px]">
          <div className="flex-1 h-24 relative">
            <Media src={data.funding.bannerUrl} alt={data.funding.title} aspect="auto" height={96} loadingState={loadingState} />
            {/* 상태 태그 오버레이 */}
            {showStateTag &&
              (() => {
                const badgeInfo = getStateBadgeInfo ? getStateBadgeInfo(data.funding.state, data.funding.fundingType) : { text: '진행중', className: 'bg-amber-300 text-slate-900' };

                return (
                  <div className={`absolute top-[6px] left-[6px] px-1.5 py-[3px] rounded-md ${badgeInfo.className}`}>
                    <div className="text-[10px] font-medium leading-3">{badgeInfo.text}</div>
                  </div>
                );
              })()}
          </div>
          <div className="flex flex-col items-center justify-between p-0 gap-2 h-24">
            {isFunding ? (
              <>
                {/* 펀딩 카드: 보고싶어요 하트 버튼 */}
                <button onClick={handleVoteClick} className="p-0 rounded-full transition-transform hover:scale-110">
                  <HeartIcon filled={data.funding.isLiked} size={14} />
                </button>
                {/* 바코드 - 하트 버튼이 있어서 남은 공간만 사용 */}
                <div className="flex-1 min-h-0">
                  <BarcodeDecor height="full" />
                </div>
              </>
            ) : (
              /* 투표 카드: 바코드만 h-full로 전체 높이 채움 */
              <BarcodeDecor height="full" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          {/* 프로젝트 제목 */}
          <h3 className="text-sm font-semibold leading-tight text-slate-50 line-clamp-2 h-10">{data.funding.title}</h3>
          {/* 배지 영역 */}
          <div className="flex gap-1 flex-wrap ">
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">{formatLocation(data.cinema.city, data.cinema.district)}</span>
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">{formatDate(data.funding.fundingEndsOn)}</span>
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">{formatDate(data.funding.screenDate)}</span>
          </div>
          {/* 영화관 이름 */}
          <h4 className="text-xs font-normal leading-tight text-slate-300 line-clamp-2 h-8">{data.cinema.cinemaName}</h4>
        </div>

        <PerforationLine />

        <div className="flex-1 flex flex-col justify-end min-h-0">
          {isFunding ? (
            <FundingInfo
              price={data.funding.price}
              progressRate={data.funding.progressRate}
              participantCount={data.funding.participantCount}
              maxPeople={data.funding.maxPeople}
              fundingEndsOn={data.funding.fundingEndsOn}
              loadingState={loadingState}
            />
          ) : (
            <VoteInfo likeCount={data.funding.favoriteCount} isLiked={data.funding.isLiked} loadingState={loadingState} onClick={() => handleVoteClick({} as React.MouseEvent)} />
          )}
        </div>
      </div>
    </div>
  );
};

export { CineCardVertical };
export type { FundingData, VoteData, ListCardData };
