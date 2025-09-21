import React from 'react';
import { Media } from '@/components/cards/primitives/Media';
import { ProjectInfoSection } from '@/components/cards/sections/ProjectInfoSection';
import { ProgressInfoSection } from '@/components/cards/sections/ProgressInfoSection';
import { ActionSection } from '@/components/cards/sections/ActionSection';
import { MobileFixedActions } from '@/components/cards/MobileFixedActions';
import { useFundingDetail } from '@/contexts/FundingDetailContext';

// 🟢 펀딩 상세 카드 Props 타입 정의
type FundingDetailCardProps = {
  fundingId: number;                        // React Query 캐시 key용 ID
};

const FundingDetailCard: React.FC<FundingDetailCardProps> = ({
  fundingId,
}) => {
  // 🟢 Context에서 데이터 가져오기
  const { data, userId } = useFundingDetail();
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
          />
        </div>

        {/* 오른쪽: 프로젝트 정보 영역 */}
        <div className="flex-1 min-w-0 px-4 py-5 flex flex-col justify-between">
          {/* 프로젝트 기본 정보 */}
          <ProjectInfoSection />

          {/* 진행 현황 + 액션 버튼 */}
          <div className="flex flex-col gap-4">
            <ProgressInfoSection />

            {/* 데스크톱 전용 액션 버튼 */}
            <div className="sm:block hidden">
              <ActionSection
                fundingId={fundingId}          // 자식이 캐시에서 likeCount, isLiked, isParticipated 조회
              />
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 전용 하단 고정 액션 버튼 */}
      <MobileFixedActions
        fundingId={fundingId}              // 자식이 캐시에서 상태 조회
      />
    </>
  );
};

export { FundingDetailCard };
export type { FundingDetailCardProps };
