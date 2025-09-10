import React from 'react';
import { Media } from './primitives/Media';
import { BarcodeDecor } from './primitives/BarcodeDecor';
import { PerforationLine } from './primitives/PerforationLine';
import { VoteBlock } from './blocks/VoteBlock';
import { FundingBlock } from './blocks/FundingBlock';
import { HeartIcon } from '../icons/HeartIcon';

// 백엔드 데이터 타입 정의
type FundingData = {
  type: 'funding';
  funding: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    state: string;
    progressRate: number;
    isClosed: boolean;
    fundingStartsOn: string;
    fundingEndsOn: string;
    price: number;
  };
  proposer: {
    proposerId: number;
    creatorNickname: string;
  };
  screening: {
    videoName: string;
    screeningTitle: string;
    screenStartsOn: number;
    screenEndsOn: number;
    cinema: {
      cinemaName: string;
      theaterType: string;
      region: string;
    };
  };
  participation: {
    participantCount: number;
    maxPeople: number;
    viewCount: number;
    likeCount: number;
    isLike: boolean;
  };
  metadata: {
    categoryId: number;
    recommendationScore: number;
  };
};

type VoteData = {
  type: 'vote';
  vote: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    state: string;
    isClosed: boolean;
    fundingStartsOn: string;
    fundingEndsOn: string;
  };
  proposer: {
    proposerId: number;
    proposerNickname: string;
  };
  screening: {
    videoName: string;
    screeningTitle: string;
    screenStartsOn: string;
    screenEndsOn: string;
    cinema: {
      cinemaName: string;
      cinemaType: string;
      region: string;
    };
  };
  participation: {
    participantCount: number;
    maxPeople: number;
    viewCount: number;
    likeCount: number;
    isLike: boolean;
  };
  metadata: {
    categoryId: number;
    recommendationScore: number;
  };
};

type CineCardProps = {
  data: FundingData | VoteData;
  loadingState?: 'ready' | 'loading' | 'error';
  onVoteClick?: (fundingId: number) => void;
  onCardClick?: (fundingId: number) => void;
};

const CineCard: React.FC<CineCardProps> = ({ data, loadingState = 'ready', onVoteClick, onCardClick }) => {
  const isFunding = data.type === 'funding';

  const formatRegion = (region: string) => {
    const regionMap: { [key: string]: string } = {
      seoul: '서울',
      busan: '부산',
      incheon: '인천',
      // 추가 지역 매핑
    };
    return regionMap[region] || region;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatTime = (hour: number) => {
    return `${hour}:00`;
  };

  const handleCardClick = () => {
    if (onCardClick) {
      const fundingId = isFunding ? data.funding.fundingId : data.vote.fundingId;
      onCardClick(fundingId);
    }
  };

  const handleVoteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onVoteClick) {
      const fundingId = isFunding ? data.funding.fundingId : data.vote.fundingId;
      onVoteClick(fundingId);
    }
  };

  return (
    <div
      className="min-w-44 overflow-hidden cursor-pointer hover:bg-slate-750 transition-colors"
      onClick={handleCardClick}
    >
      {/* 상단 영역 (이미지 + 정보) */}
      <div className="p-3 bg-slate-800 rounded-xl space-y-2">
        {/* 이미지 영역 */}
        <div className="flex gap-[5px]">
          <div className="flex-1 h-24">
            <Media
              src={isFunding ? data.funding.bannerUrl : data.vote.bannerUrl}
              alt={data.screening.videoName}
              aspect="auto"
              height={96}
              loadingState={loadingState}
            />
          </div>
          <div className="flex flex-col items-center justify-between p-0 gap-2 h-24">
            {isFunding ? (
              <>
                {/* 펀딩 카드: 보고싶어요 하트 버튼 */}
                <button onClick={handleVoteClick} className="p-0 rounded-full transition-transform hover:scale-110">
                  <HeartIcon filled={data.participation.isLike} size={14} />
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
          {/* 상영물 제목 */}
          <h3 className="text-sm font-semibold leading-tight text-slate-50 line-clamp-2 h-10">
            {data.screening.videoName}
          </h3>
          {/* 배지 영역: 나중에 컴포넌트 넣기 */}
          {/* px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded */}
          <div className="flex gap-1 flex-wrap ">
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">
              {formatRegion(data.screening.cinema.region)}
            </span>
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">
              {isFunding ? formatDate(data.funding.fundingEndsOn) : formatDate(data.vote.fundingEndsOn)}
            </span>
            {isFunding && (
              <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">
                {formatTime(data.screening.screenStartsOn)}-{formatTime(data.screening.screenEndsOn)}
              </span>
            )}
          </div>
          {/* 프로젝트 제목 */}
          <p className="text-xs font-normal text-slate-300 line-clamp-2 leading-none">
            {data.screening.screeningTitle}
          </p>
        </div>
      </div>

      {/* 절취선 */}
      <PerforationLine />

      {/* 하단 영역 */}
      <div className="p-3 bg-slate-800 rounded-xl">
        {isFunding ? (
          <FundingBlock
            price={data.funding.price}
            progressRate={data.funding.progressRate}
            participantCount={data.participation.participantCount}
            maxPeople={data.participation.maxPeople}
            fundingEndsOn={data.funding.fundingEndsOn}
            loadingState={loadingState}
          />
        ) : (
          <div onClick={handleVoteClick}>
            <VoteBlock
              likeCount={data.participation.likeCount}
              isLiked={data.participation.isLike}
              loadingState={loadingState}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export { CineCard };
export type { CineCardProps, FundingData, VoteData };
