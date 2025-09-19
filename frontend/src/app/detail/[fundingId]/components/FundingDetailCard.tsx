import React from 'react';
import { Media } from '@/components/cards/primitives/Media';
import { ProjectInfoSection } from '@/components/cards/sections/ProjectInfoSection';
import { ProgressInfoSection } from '@/components/cards/sections/ProgressInfoSection';
import { ActionSection } from '@/components/cards/sections/ActionSection';
import { MobileFixedActions } from '@/components/cards/MobileFixedActions';
import type { FundingDetailData } from '@/types/fundingDetail';

// 🟢 펀딩 상세 카드 Props 타입 정의
type FundingDetailCardProps = {
  data: FundingDetailData;                  // 펀딩 상세 데이터
  fundingId?: number;                       // 🆕 React Query용 ID
  loadingState?: 'ready' | 'loading';       // 로딩 상태
};

const FundingDetailCard: React.FC<FundingDetailCardProps> = ({
  data,
  fundingId,                    // 🆕 추가
  loadingState = 'ready',
}) => {
  // 🟢 구조분해 할당으로 필요한 데이터 꺼냄
  const { funding, proposer, screening, stat, category, cinema } = data;

  return (
    <>
      {/* 메인 레이아웃: 이미지 + 정보 */}
      <div className="w-full min-w-0 py-5 flex flex-col sm:flex-row justify-between sm:gap-12">
        {/* 왼쪽: 영화 배너 이미지 */}
        <div className="w-full sm:w-[465px] h-auto sm:h-[420px]">
          <Media
            src={funding.bannerUrl}
            alt={funding.title}
            aspect="auto"
            height={420}
            loadingState={loadingState}
          />
        </div>

        {/* 오른쪽: 프로젝트 정보 영역 */}
        <div className="flex-1 min-w-0 px-4 py-5 flex flex-col justify-between">
          {/* 프로젝트 기본 정보 (카테고리, 영상 제목, 상영회 제목 등) */}
          <ProjectInfoSection
            categoryId={category.categoryId}
            movieTitle={screening.videoName}
            projectTitle={funding.title}
            type="funding"
            loadingState={loadingState}
          />

          {/* 진행 현황 + 액션 버튼 */}
          <div className="flex flex-col gap-4">
            {/* 진행률/참여자수/좋아요 수 */}
            <ProgressInfoSection
              type="funding"
              participantCount={stat.participantCount}
              likeCount={stat.likeCount}
              endDate={funding.fundingEndsOn}
              progressRate={funding.progressRate}
              maxPeople={stat.maxPeople}
              loadingState={loadingState}
            />

            {/* 데스크톱 전용 액션 버튼 */}
            <div className="sm:block hidden">
              <ActionSection
                type="funding"
                fundingId={fundingId}          // 🆕 React Query용 ID 전달
                price={funding.price}
                likeCount={stat.likeCount}
                isLiked={stat.isLiked}
                isParticipated={stat.isParticipated} // 🆕 참여 여부 전달
                loadingState={loadingState}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 전용 하단 고정 액션 버튼 */}
      <MobileFixedActions
        type="funding"
        fundingId={fundingId}              // 🆕 React Query용 ID 전달 (모바일도)
        price={funding.price}
        likeCount={stat.likeCount}
        isLiked={stat.isLiked}
        isParticipated={stat.isParticipated} // 🆕 참여 여부 전달 (모바일도)
        loadingState={loadingState}
      />
    </>
  );
};

export { FundingDetailCard };
export type { FundingDetailCardProps };
