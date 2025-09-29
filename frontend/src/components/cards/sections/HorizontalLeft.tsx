import React from 'react';
import { Media } from '../primitives/Media';
import { HeartIcon } from '@/components/icon/heartIcon';
import { ApiSearchItem, FundingState, FundingType } from '@/types/searchApi';

type HorizontalLeftProps = {
  data: ApiSearchItem;
  loadingState?: 'ready' | 'loading' | 'error';
  formatDate: (dateString: string) => string;
  isFunding: boolean;
  currentIsLiked: boolean;
  isLoading: boolean;
  onVoteClick: (e: React.MouseEvent) => void;
  showStateTag?: boolean;
  getStateBadgeInfo?: (state: FundingState, fundingType: FundingType) => { text: string; className: string };
  backgroundColor?: 'bg-BG-0' | 'bg-BG-1';
};

const HorizontalLeft: React.FC<HorizontalLeftProps> = ({
  data,
  loadingState = 'ready',
  formatDate,
  isFunding,
  currentIsLiked,
  isLoading,
  onVoteClick,
  showStateTag = false,
  getStateBadgeInfo,
  backgroundColor = 'bg-BG-1',
}) => {
  // 종료 상태 확인 - fundingEndsOn 날짜 기준
  const isEnded = (() => {
    const endDate = new Date(data.funding.fundingEndsOn);
    const now = new Date();
    // 시간 부분 제거하고 날짜만 비교
    endDate.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);
    return endDate < now; // 종료일이 오늘보다 이전이면 종료
  })();
  return (
    <div className={`${backgroundColor} flex-1 min-w-0 p-3 flex justify-start items-center gap-3 rounded-xl hover:rounded-xl`}>
      <div className="w-16 relative rounded overflow-hidden flex items-center justify-center">
        <Media src={data.funding.bannerUrl} alt={data.funding.title} aspect="7/10" height={96} rounded={false} loadingState={loadingState} className={`${isEnded ? 'opacity-30' : ''}`} />
        {isEnded && (
          <div className="absolute text-white caption1-b text-center">
            마감
            <br />
            되었습니다
          </div>
        )}
        {/* 상태 태그 오버레이 */}
        {showStateTag &&
          (() => {
            const badgeInfo = getStateBadgeInfo ? getStateBadgeInfo(data.funding.state, data.funding.fundingType) : { text: '대기중', className: 'bg-amber-300 text-secondary' };

            return (
              <div className={`absolute top-[4px] left-[4px] px-1 py-[2px] rounded-md ${badgeInfo.className}`}>
                <div className="text-[8px] font-semibold">{badgeInfo.text}</div>
              </div>
            );
          })()}

        {/* 펀딩 카드일 때만 좋아요 버튼 표시 */}
        {isFunding && (
          <button onClick={onVoteClick} className="absolute top-0.5 left-0.5 p-1 rounded-full" disabled={isLoading}>
            <HeartIcon filled={currentIsLiked} size={24} />
          </button>
        )}
      </div>
      {/* 영화 정보 */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* 영화 제목 - 2줄 */}
        <h3 className="text-sm font-semibold text-slate-50 line-clamp-2 leading-tight">{data.funding.videoName}</h3>

        {/* 위치 및 날짜 정보 */}
        <div className="flex flex-wrap gap-1">
          <span className="p-1 bg-slate-600 text-slate-300 text-caption2 rounded">{data.cinema.district}</span>
          <span className="p-1 bg-slate-600 text-slate-300 text-caption2 rounded">{formatDate(isFunding ? data.funding.screenDate : data.funding.fundingEndsOn)}</span>
        </div>

        {/* 프로젝트 제목 - 1줄 */}
        <p className="p3 text-secondary line-clamp-1">{data.funding.title}</p>
      </div>
    </div>
  );
};

export { HorizontalLeft };
export type { HorizontalLeftProps };
