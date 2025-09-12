import React from 'react';
import { Media } from './primitives/Media';
import { ProjectInfoSection } from './sections/ProjectInfoSection';
import { ProgressInfoSection } from './sections/ProgressInfoSection';
import { ActionSection } from './sections/ActionSection';
import { MobileFixedActions } from './MobileFixedActions';

type ProjectType = 'funding' | 'vote';

// 펀딩 상세 API 타입
type FundingDetailData = {
  type: 'funding';
  funding: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    content: string;
    state: string;
    progressRate: number;
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
  };
  stat: {
    maxPeople: number;
    participantCount: number;
    viewCount: number;
    likeCount: number;
    isLiked: boolean;
  };
  metadata: {
    categoryId: number;
    recommendationScore: number;
  };
  screen: {
    screenId: number;
    screenName: string;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
  };
};

// 투표 상세 API 타입
type VoteDetailData = {
  type: 'vote';
  vote: {
    fundingId: number;
    title: string;
    bannerUrl: string;
    content: string;
    state: string;
    fundingStartsOn: string;
    fundingEndsOn: string;
  };
  proposer: {
    proposerId: number;
    creatorNickname: string;
  };
  screening: {
    videoName: string;
    screeningTitle: string;
    screenStartsOn: string;
    screenEndsOn: string;
  };
  participation: {
    viewCount: number;
    likeCount: number;
    isLike: boolean;
  };
  metadata: {
    categoryId: number;
    recommendationScore: number;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    city: string;
    district: string;
    lat?: number;
    lng?: number;
  };
};

type CineDetailCardData = FundingDetailData | VoteDetailData;

type CineDetailCardProps = {
  data: CineDetailCardData;
  loadingState?: 'ready' | 'loading';
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

const CineDetailCard: React.FC<CineDetailCardProps> = ({ 
  data, 
  loadingState = 'ready',
  onPrimaryAction,
  onSecondaryAction 
}) => {
  const { type } = data;
  const isFunding = type === 'funding';
  
  // 데이터 추출 (타입에 따라 분기)
  const fundingData = isFunding ? (data as FundingDetailData).funding : null;
  const voteData = !isFunding ? (data as VoteDetailData).vote : null;
  const statData = isFunding ? (data as FundingDetailData).stat : null;
  const participationData = !isFunding ? (data as VoteDetailData).participation : null;

  const bannerUrl = isFunding ? fundingData!.bannerUrl : voteData!.bannerUrl;
  const title = isFunding ? fundingData!.title : voteData!.title;
  const endDate = isFunding ? fundingData!.fundingEndsOn : voteData!.fundingEndsOn;
  const participantCount = isFunding ? statData!.participantCount : participationData!.likeCount;
  const likeCount = isFunding ? statData!.likeCount : participationData!.likeCount;
  const isLiked = isFunding ? statData!.isLiked : participationData!.isLike;

  return (
    <>
      {/* 메인 카드 */}
      <div className="w-full max-w-[1200px] py-5 flex flex-col sm:flex-row gap-5 sm:gap-12">
        {/* 이미지 영역 */}
        <div className="w-full sm:w-[465px] h-[346px] sm:h-[420px]">
          <Media 
            src={bannerUrl}
            alt={title}
            aspect="auto"
            height={420}
            loadingState={loadingState}
          />
        </div>
        
        {/* 정보 영역 */}
        <div className="flex-1 px-4 py-5 border-b border-slate-700 flex flex-col justify-between">
          {/* 프로젝트 정보 */}
          <ProjectInfoSection
            categoryId={data.metadata.categoryId}
            movieTitle={data.screening.videoName}
            projectTitle={data.screening.screeningTitle}
            type={type}
            loadingState={loadingState}
          />
          
          {/* 진행 정보 + 액션 */}
          <div className="flex flex-col gap-3">
            <ProgressInfoSection
              type={type}
              participantCount={participantCount}
              endDate={endDate}
              progressRate={isFunding ? fundingData!.progressRate : undefined}
              maxPeople={isFunding ? statData!.maxPeople : undefined}
              loadingState={loadingState}
            />
            
            {/* 데스크톱 액션 영역 */}
            <div className="sm:block hidden">
              <ActionSection
                type={type}
                price={isFunding ? fundingData!.price : undefined}
                likeCount={likeCount}
                isLiked={isLiked}
                onPrimaryAction={onPrimaryAction}
                onSecondaryAction={onSecondaryAction}
                loadingState={loadingState}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* 모바일 하단 고정 액션 */}
      <MobileFixedActions
        type={type}
        price={isFunding ? fundingData!.price : undefined}
        likeCount={likeCount}
        isLiked={isLiked}
        onPrimaryAction={onPrimaryAction}
        onSecondaryAction={onSecondaryAction}
        loadingState={loadingState}
      />
    </>
  );
};

export { CineDetailCard };
export type { CineDetailCardProps, CineDetailCardData, FundingDetailData, VoteDetailData, ProjectType };