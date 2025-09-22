import React from 'react';
import { Button } from '@/components/ui/button';                  // 버튼 컴포넌트
import { Skeleton } from '@/components/ui/skeleton';              // 로딩 스켈레톤
import { Dialog, DialogTrigger } from '@/components/ui/dialog';   // 모달 컴포넌트
import Payment from '@/app/(main)/payment/Payment';               // 결제 모달 내용
import { HeartIcon } from '@/component/icon/heartIcon';           // 하트 아이콘
import { useFundingLike, useFundingDetail } from '@/hooks/queries'; // 리액트 쿼리 훅(상세/좋아요 토글)
import { useAuthStore } from '@/stores/authStore';                // 로그인 사용자 상태
import { useFundingDetail as useFundingDetailContext } from '@/contexts/FundingDetailContext';

// ✅ 펀딩 전용 액션 섹션 Props: 최소한의 정보만 전달
type ActionSectionProps = {
  fundingId: number;                         // 필수: 어떤 펀딩인지 식별 (캐시 Key)
};

const ActionSection: React.FC<ActionSectionProps> = ({
  fundingId,
}) => {
  // Context에서 데이터 가져오기
  const { data: contextData, userId: contextUserId } = useFundingDetailContext();
  const { user } = useAuthStore();
  const storeUserId = user?.userId?.toString();

  // ✅ context → store 순으로 fallback
  const userId = contextUserId || storeUserId;

  // 좋아요 토글 mutation
  const likeMutation = useFundingLike();

  // 상세데이터 캐시 조회 (React Query로 최신 상태 유지)
  const { data: detailData } = useFundingDetail({
    fundingId: fundingId.toString(),
    userId,
  });
  
  console.log("ActionSection userId", userId)

  let currentIsLiked = false; // 현재 좋아요 여부
  let currentLikeCount = 0; // 현재 좋아요 수
  let isParticipated = false; // 현재 참여 여부
  
  if (detailData?.type === 'FUNDING') {
    currentIsLiked = detailData.stat.isLiked;
    currentLikeCount = detailData.stat.likeCount;
    isParticipated = detailData.stat.isParticipated ?? false;
  }
  
  // Context에서 price 가져오기
  const price = contextData.funding.price;
  

  // ✅ 좋아요 버튼 클릭: 미로그인 방지 + 낙관적 업데이트
  const handleLikeClick = () => {
    if (!userId) {                                                 // 로그인 필요 체크
      alert('로그인 후 이용해주세요.');
      return;
    }
    likeMutation.mutate({
      fundingId,                                                   // 펀딩 식별자
      userId,                                                      // 필수: 서버 API 요구
      isLiked: currentIsLiked,                                     // 현재값 기반 토글
    });
  };


  return (
    <div className="flex flex-col pt-5 border-t border-slate-600 gap-4">
      {/* 💵 가격 정보: 서버값 그대로 노출 */}
      <div className="w-full flex justify-between items-center">
        <span className="h6 text-tertiary">1인당 결제 금액</span>
        <span className="h4-b text-primary">{price.toLocaleString()}원</span>
      </div>

      {/* 🔘 액션 버튼 영역: 좋아요 + 참여하기(결제) */}
      <div className="w-full inline-flex justify-start items-center gap-2">
        {/* ❤️ 좋아요 버튼: 낙관적 업데이트로 즉시 반영 */}
        <Button
          variant="outline"                                        // 외곽선 스타일
          size="lg"                                                // 라지 사이즈
          textSize="lg"                                            // 라지 폰트 (커스텀 prop 가정)
          className={`${
            currentIsLiked
              ? 'h5-b border-Brand1-Strong text-Brand1-Strong gap-1 hover:border-Brand1-Strong hover:text-Brand1-Strong'
              : 'h5-b gap-1'
          }`}
          onClick={handleLikeClick}                                // 클릭 핸들러
          disabled={likeMutation.isPending}                        // 중복 클릭 방지
        >
          <HeartIcon stroke={currentIsLiked ? '#FF5768' : '#94A3B8'} /> {/* 색상 토글 */}
          {currentLikeCount}                                       {/* 좋아요 수 */}
        </Button>

        {/* 🎟️ 참여하기 버튼 → 결제 모달 오픈 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="brand1"                                     // 브랜드 강조 색
              size="lg"
              textSize="lg"
              className="w-full"                                   // 남은 영역 가득
              disabled={isParticipated}                            // 이미 참여했다면 비활성화
            >
              {isParticipated ? '참여완료' : '참여하기'}
            </Button>
          </DialogTrigger>

          {/* 결제 모달: Context에서 데이터 가져오기 */}
          <Payment
            fundingId={fundingId}                                  // 결제 대상 펀딩
            userId={userId}                                        // 로그인 사용자 (없으면 결제 진행 불가 처리 필요)
            amount={price}                                         // 결제 금액
            title={contextData.funding.title}                      // 펀딩 제목
            videoName={contextData.screening.videoName}            // 영화 제목
            fundingEndsOn={contextData.funding.fundingEndsOn}      // 펀딩 종료일
            screenStartsOn={contextData.screening.screenStartsOn}  // 상영 시작 시간
            screenEndsOn={contextData.screening.screenEndsOn}      // 상영 종료 시간
            cinemaName={contextData.cinema.cinemaName}             // 영화관명
            screenName={contextData.screen?.screenName}            // 상영관명
            screenFeatures={{
              isDolby: contextData.screen?.isDolby,
              isImax: contextData.screen?.isImax,
              isScreenx: contextData.screen?.isScreenx,
              is4dx: contextData.screen?.is4dx,
              isRecliner: contextData.screen?.isRecliner,
            }}
          />
        </Dialog>
      </div>
    </div>
  );
};

export { ActionSection };
export type { ActionSectionProps };
