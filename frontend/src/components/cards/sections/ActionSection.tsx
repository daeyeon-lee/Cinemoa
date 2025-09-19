import React from 'react';
import { Button } from '@/components/ui/button';                  // 버튼 컴포넌트
import { Skeleton } from '@/components/ui/skeleton';              // 로딩 스켈레톤
import { Dialog, DialogTrigger } from '@/components/ui/dialog';   // 모달 컴포넌트
import Payment from '@/app/(main)/payment/Payment';               // 결제 모달 내용
import { HeartIcon } from '@/component/icon/heartIcon';           // 하트 아이콘
import { useFundingLike, useFundingDetail } from '@/hooks/queries'; // 리액트 쿼리 훅(상세/좋아요 토글)
import { useAuthStore } from '@/stores/authStore';                // 로그인 사용자 상태

// ✅ 펀딩 전용 액션 섹션 Props: 최소한의 정보만 전달
type ActionSectionProps = {
  fundingId: number;                         // 필수: 어떤 펀딩인지 식별 (캐시 Key)
  userId?: string;                          // 로그인 사용자 ID
  price: number;                             // 필수: 1인당 결제 금액
  loadingState?: 'ready' | 'loading';        // 선택: 상위에서 강제 로딩 표시가 필요할 때
};

const ActionSection: React.FC<ActionSectionProps> = ({
  fundingId,
  userId: propUserId, // 이름 바꿔줌 (prop에서 받은 userId)
  price,
  loadingState = 'ready',
}) => {
  const { user } = useAuthStore();
  const storeUserId = user?.userId?.toString();

  // ✅ props → store 순으로 fallback
  const userId = propUserId || storeUserId;

  // 좋아요 토글 mutation
  const likeMutation = useFundingLike();

  // 상세데이터 캐시 조회
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

  // ✅ 로딩 스켈레톤(상위에서 강제 로딩을 지정한 경우)
  if (loadingState === 'loading') {
    return (
      <div className="flex flex-col mt-5 gap-4">
        <div className="inline-flex justify-between items-center">
          <Skeleton className="h-4 w-12" />                        {/* '1인당' 자리 */}
          <Skeleton className="h-5 w-16" />                        {/* 금액 자리 */}
        </div>
        <div className="inline-flex gap-2">
          <Skeleton className="h-10 w-28" />                       {/* 좋아요 버튼 */}
          <Skeleton className="h-10 flex-1" />                     {/* 참여하기 버튼 */}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col pt-5 border-t border-slate-600 gap-4">
      {/* 💵 가격 정보: 서버값 그대로 노출 */}
      <div className="w-full inline-flex justify-between items-center">
        <div className="inline-flex flex-col justify-start items-start">
          <div className="justify-center h6 text-tertiary">1인당</div>   {/* 라벨 */}
        </div>
        <div className="inline-flex flex-col justify-start items-start">
          <div className="justify-center h5-b text-primary">
            {price.toLocaleString()}원                                {/* 금액(천단위 콤마) */}
          </div>
        </div>
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

          {/* 결제 모달: 서버 요구 파라미터 전달 */}
          <Payment
            fundingId={fundingId}                                  // 결제 대상 펀딩
            userId={userId}                                        // 로그인 사용자 (없으면 결제 진행 불가 처리 필요)
            amount={price}                                         // 결제 금액
          />
        </Dialog>
      </div>
    </div>
  );
};

export { ActionSection };
export type { ActionSectionProps };
