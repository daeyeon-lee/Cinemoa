import React from 'react';
import { Media } from '@/components/cards/primitives/Media';
import { ProjectInfoSection } from '@/components/cards/sections/ProjectInfoSection';
import { ProgressInfoSection } from '@/components/cards/sections/ProgressInfoSection';
import { ActionSection } from '@/components/cards/sections/ActionSection';
import { MobileFixedActions } from '@/components/cards/MobileFixedActions';
import type { FundingDetailData } from '@/types/fundingDetail';

// 🟢 펀딩 상세 카드 Props 타입 정의
type FundingDetailCardProps = {
  data: FundingDetailData;                  // 부모가 내려주는 펀딩 상세 데이터
  fundingId: number;                        // React Query 캐시 key용 ID
  userId?: string;                          // 로그인 사용자 ID
  loadingState?: 'ready' | 'loading';       // 로딩 상태
};

const FundingDetailCard: React.FC<FundingDetailCardProps> = ({
  data,
  fundingId,
  userId,
  loadingState = 'ready',
}) => {
  // 🟢 구조분해 할당으로 필요한 데이터 꺼냄
  const { funding, screening, stat, category } = data;

  console.log("FundingDetailCard props:", userId)

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
          {/* 프로젝트 기본 정보 */}
          <ProjectInfoSection
            categoryId={category.categoryId}
            movieTitle={screening.videoName}
            projectTitle={funding.title}
            loadingState={loadingState}
          />

          {/* 진행 현황 + 액션 버튼 */}
          <div className="flex flex-col gap-4">
            <ProgressInfoSection
              participantCount={stat.participantCount}   // 부모에서 내려주는 값 그대로 사용
              likeCount={stat.likeCount}                 // 실시간 중요도 낮으므로 그대로 사용
              endDate={funding.fundingEndsOn}
              progressRate={funding.progressRate}
              maxPeople={stat.maxPeople}
              loadingState={loadingState}
            />

            {/* 데스크톱 전용 액션 버튼 */}
            <div className="sm:block hidden">
              <ActionSection
                fundingId={fundingId}          // 자식이 캐시에서 likeCount, isLiked, isParticipated 조회
                userId={userId}
                price={funding.price}
                loadingState={loadingState}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 전용 하단 고정 액션 버튼 */}
      <MobileFixedActions
        fundingId={fundingId}              // 자식이 캐시에서 상태 조회
        price={funding.price}
        loadingState={loadingState}
      />
    </>
  );
};

export { FundingDetailCard };
export type { FundingDetailCardProps };
