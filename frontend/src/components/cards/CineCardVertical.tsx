import React from 'react';
import { Media } from './primitives/Media';
import { BarcodeDecor } from './primitives/BarcodeDecor';
import { PerforationLine } from './primitives/PerforationLine';
import { VoteInfo } from './blocks/VoteInfo';
import { FundingInfo } from './blocks/FundingInfo';
import { HeartIcon } from '@/component/icon/heartIcon';
import { ApiSearchItem, FundingType, FundingState } from '@/types/searchApi';

type CineCardProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  onCardClick?: (id: number) => void;
  onVoteClick?: (id: number) => void;
  showStateTag?: boolean;
  stateTagClassName?: string;
  getStateBadgeInfo?: (state: FundingState, fundingType: FundingType) => { text: string; className: string };
};

const CineCardVertical: React.FC<CineCardProps> = ({ data, loadingState = 'ready', onVoteClick, onCardClick, showStateTag = false, stateTagClassName = '', getStateBadgeInfo }) => {
  // API 데이터 확인용 로그 - TODO: 개발 완료 후 제거
  // console.log('CineCardVertical - API data:', JSON.stringify(data, null, 2));

  const isFunding = data.funding.fundingType === 'FUNDING';

  // ✅ props로만 제어 - React Query 캐시에서 오는 값 사용
  const currentIsLiked = data.funding.isLiked;
  const currentLikeCount = data.funding.favoriteCount;

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
    
    // ✅ 단순히 부모의 핸들러만 호출 - 모든 로직은 부모에서 처리
    if (onVoteClick) {
      onVoteClick(data.funding.fundingId);
    }
  };

  if (loadingState === 'loading') {
    return (
      <div className="w-full aspect-[420/600] bg-slate-700 animate-pulse rounded-xl">
        <div className="p-3 space-y-2">
          <div className="h-4 bg-slate-600 rounded w-3/4"></div>
          <div className="h-3 bg-slate-600 rounded w-1/2"></div>
          <div className="h-20 bg-slate-600 rounded"></div>
        </div>
      </div>
    );
  }

  if (loadingState === 'error') {
    return (
      <div className="w-full aspect-[420/600] bg-slate-700 rounded-xl flex items-center justify-center">
        <p className="text-slate-400">카드를 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="w-full cursor-pointer transition-transform hover:scale-[1.02]" onClick={handleCardClick}>
      <div className="bg-BG-1 rounded-xl p-3 gap-3">
        {/* 이미지영역 */}
        <div className="flex gap-1.5 items-stretch">
          <div className="flex-1 relative">
            <Media src={data.funding.bannerUrl} alt={data.funding.title} aspect="7/10" loadingState={loadingState} className="h-full w-full" />
            {/* 상태 태그 오버레이 */}
            {showStateTag &&
              (() => {
                const badgeInfo = getStateBadgeInfo ? getStateBadgeInfo(data.funding.state, data.funding.fundingType) : { text: '대기중', className: 'bg-amber-300 text-secondary' };

                return (
                  <div className={`absolute top-[6px] left-[6px] px-1.5 py-[3px] rounded-md ${badgeInfo.className}`}>
                    <div className="p3-b">{badgeInfo.text}</div>
                  </div>
                );
              })()}
          </div>
          {/* 이미지 오른쪽 바코드 */}
          <div className="w-6 flex flex-col items-center justify-between gap-2">
            {isFunding ? (
              <>
                {/* 펀딩 카드: 보고싶어요 하트 버튼 */}
                <button onClick={handleVoteClick} className="p-0 rounded-full transition-transform hover:scale-110">
                  <HeartIcon filled={currentIsLiked} size={24} />
                </button>
                {/* 바코드 - 하트 버튼이 있어서 남은 공간만 사용 */}
                <div className="flex-1 min-h-0">
                  <BarcodeDecor height="full" className="flex-1" />
                </div>
              </>
            ) : (
              /* 투표 카드: 바코드만 전체 높이 채움 */
              <BarcodeDecor height="full" className="flex-1" />
            )}
          </div>
        </div>
        {/* 영화 정보 */}
        <div className="space-y-2 mt-3">
          {/* 영화 제목 */}
          <h3 className="text-p2-b line-clamp-2 leading-tight min-h-[2.5rem]">{data.funding.videoName}</h3>
          {/* 배지 영역(지역+상영날짜) */}
          <div className="flex gap-1 flex-wrap ">
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">{data.cinema.district}</span>
            <span className="px-[6px] py-[3px] bg-slate-600 text-slate-300 text-[10px] font-semibold rounded">
              {isFunding ? formatDate(data.funding.screenDate) : formatDate(data.funding.fundingEndsOn)}
            </span>
          </div>
          {/* 프로젝트 제목 */}
          <h4 className="text-p3 line-clamp-1 truncate">{data.funding.title}</h4>
        </div>
      </div>
      <PerforationLine />
      {/* 카드 하단 */}
      <div className="flex-1 flex flex-col justify-end bg-BG-1 rounded-xl p-3 pb-4">
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
          <VoteInfo likeCount={currentLikeCount} isLiked={currentIsLiked} loadingState={loadingState} onClick={handleVoteClick} />
        )}
      </div>
    </div>
  );
};

export { CineCardVertical };
export type { CineCardProps };
