import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button'; // 버튼 컴포넌트
import { Dialog } from '@/components/ui/dialog'; // 결제 모달용
import Payment from '@/app/(main)/payment/Payment'; // 결제 모달 내용
import RefundConfirm from '@/app/(main)/refund/RefundConfirm'; // 환불 확인 모달
import AlertDialog from '@/components/ui/alert-dialog'; // 참여 불가 모달
// import ConfirmDialog from '@/components/ui/confirm-dialog'; // 환불 완료 모달 - 사용하지 않음
import { HeartIcon } from '@/component/icon/heartIcon'; // 하트 아이콘
import { ShareButton } from '@/components/share/ShareButton'; // 공유 버튼 컴포넌트
import InfoIcon from '@/component/icon/infoIcon'; // 정보 아이콘

import { useFundingLike, useFundingDetail } from '@/hooks/queries'; // 리액트 쿼리 훅(상세/좋아요)
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/stores/authStore'; // 로그인 사용자 상태
import { useFundingDetail as useFundingDetailContext } from '@/contexts/FundingDetailContext';

// ✅ 펀딩 전용 액션 섹션 Props: 최소한의 정보만 전달
type FundingActionSectionProps = {
  fundingId: number; // 필수: 어떤 펀딩인지 식별 (캐시 Key)
  isExpired?: boolean; // 🆕 마감 여부
};

const FundingActionSection: React.FC<FundingActionSectionProps> = ({ fundingId, isExpired }) => {
  // Context에서 데이터 가져오기
  const { data: contextData, userId: contextUserId } = useFundingDetailContext();
  const { user } = useAuthStore();
  const storeUserId = user?.userId?.toString();
  const queryClient = useQueryClient();
  const router = useRouter();

  // ✅ context → store 순으로 fallback
  const userId = contextUserId || storeUserId;

  // Dialog 상태 관리
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [fullCapacityDialogOpen, setFullCapacityDialogOpen] = useState(false);
  const [refundCompleteDialogOpen, setRefundCompleteDialogOpen] = useState(false);

  // 좋아요 토글 mutation
  const likeMutation = useFundingLike();

  // 상세데이터 캐시 조회 (React Query로 최신 상태 유지)
  const { data: detailData } = useFundingDetail({
    fundingId: fundingId.toString(),
    userId,
  });

  // console.log('ActionSection userId', userId);

  let currentIsLiked = false; // 현재 좋아요 여부
  let currentLikeCount = 0; // 현재 좋아요 수
  let isParticipated = false; // 현재 참여 여부
  let progressRate = 0; // 달성률

  if (detailData?.type === 'FUNDING') {
    currentIsLiked = detailData.stat.isLiked;
    currentLikeCount = detailData.stat.likeCount;
    isParticipated = detailData.stat.isParticipated ?? false;
    progressRate = detailData.funding.progressRate;
  }

  // Context에서 price 가져오기
  const price = contextData.funding.price;

  // 달성률 100% 체크
  const isFullCapacity = progressRate >= 100;

  // ✅ 좋아요 버튼 클릭: 미로그인 방지 + 낙관적 업데이트
  const handleLikeClick = () => {
    if (!userId) {
      // 로그인 필요 체크
      alert('로그인 후 이용해주세요.');
      window.location.href = '/auth';
      return;
    }
    likeMutation.mutate({
      fundingId, // 펀딩 식별자
      userId, // 필수: 서버 API 요구
      isLiked: currentIsLiked, // 현재값 기반 토글
    });
  };

  // 🚫 참여하기 버튼 클릭: 마감 및 정원 초과 체크
  const handleParticipateClick = () => {
    // 마감된 경우 클릭 방지
    if (isExpired) {
      return;
    }
    if (isFullCapacity) {
      setFullCapacityDialogOpen(true);
      return;
    }
    // 정원에 여유가 있으면 결제 모달 열기
    setPaymentDialogOpen(true);
  };

  // 환불 완료 핸들러
  const handleRefundComplete = () => {
    setRefundDialogOpen(false); // RefundConfirm 모달 닫기
    setRefundCompleteDialogOpen(true); // 완료 모달 열기
    // 환불 성공 후 React Query 캐시 무효화하여 UI 업데이트
    queryClient.invalidateQueries({
      queryKey: ['DETAIL', fundingId.toString(), userId]
    });
  };

  // 환불 완료 모달이 떠있을 때는 기본 UI 숨기기
  if (refundCompleteDialogOpen) {
    return (
      <AlertDialog
        title="참여 취소 완료"
        content="참여 취소가 완료되었습니다"
        info="환불 처리가 완료되었습니다. 환불 금액은 결제한 카드로 영업일 기준 2-3일 내에 입금됩니다."
        icon={<InfoIcon stroke="#10B981" size={48} />}
        btnLabel="확인"
        subBtnLabel=""
        onBtnLabel={() => {
          setRefundCompleteDialogOpen(false);
          // 확인 버튼 클릭 시 새로고침 없이 페이지 이동
          router.push(`/detail/${fundingId}`);
        }}
        onSubBtnLabel={() => {}}
      />
    );
  }

  return (
    <div className="flex flex-col pt-5 border-t border-slate-600 gap-4">
      {/* 💵 가격 정보: 서버값 그대로 노출 */}
      <div className="w-full flex justify-between items-center">
        <span className="h6 text-tertiary">1인당 결제 금액</span>
        <span className="h4-b text-primary">{price.toLocaleString()}원</span>
      </div>

      {/* 🔘 액션 버튼 영역: 공유 + 좋아요 + 참여하기(결제) */}
      <div className="w-full inline-flex justify-start items-center gap-2">
        {/* 링크 공유 */}
        <ShareButton isActive={currentIsLiked} />

        {/* ❤️ 좋아요 버튼: 낙관적 업데이트로 즉시 반영 */}
        <Button
          variant="outline" // 외곽선 스타일
          size="lg" // 라지 사이즈
          textSize="lg" // 라지 폰트 (커스텀 prop 가정)
          className={`${currentIsLiked ? 'h5-b border-Brand1-Strong text-Brand1-Strong gap-1 hover:border-Brand1-Strong hover:text-Brand1-Strong' : 'h5-b gap-1'}`}
          onClick={handleLikeClick} // 클릭 핸들러
          disabled={likeMutation.isPending} // 중복 클릭 방지
        >
          <HeartIcon stroke={currentIsLiked ? '#FF5768' : '#94A3B8'} /> {/* 색상 토글 */}
          {currentLikeCount} {/* 좋아요 수 */}
        </Button>

        {/* 조건부 버튼: 참여하기(결제) 또는 참여취소(환불) */}
        {!isParticipated ? (
          // 참여하지 않은 경우: 마감, 정원 체크 후 결제 모달 또는 참여 불가 모달
          <>
            <Button 
              variant={isExpired ? "secondary" : "brand1"} 
              size="lg" 
              textSize="lg" 
              className="w-full" 
              onClick={handleParticipateClick}
              disabled={isExpired}
            >
              {isExpired ? "마감되었습니다" : "참여하기"}
            </Button>

            {/* 결제 모달 */}
            <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
              <Payment
                fundingId={fundingId}
                userId={userId}
                amount={price}
                title={contextData.funding.title}
                videoName={contextData.screening.videoName}
                screenDate={contextData.funding.screenDate}
                screenStartsOn={contextData.screening.screenStartsOn}
                screenEndsOn={contextData.screening.screenEndsOn}
                cinemaName={contextData.cinema.cinemaName}
                screenName={contextData.screen?.screenName}
                screenFeatures={{
                  isDolby: contextData.screen?.isDolby,
                  isImax: contextData.screen?.isImax,
                  isScreenx: contextData.screen?.isScreenx,
                  is4dx: contextData.screen?.is4dx,
                  isRecliner: contextData.screen?.isRecliner,
                }}
                onClose={() => setPaymentDialogOpen(false)}
              />
            </Dialog>

            {/* 참여 불가 모달 (정원 초과) */}
            {fullCapacityDialogOpen && (
              <AlertDialog
                title="참여 불가"
                content="참여 인원이 가득 찼습니다"
                // content={`현재 펀딩의 참여 인원이 가득 차서\n참여할 수 없습니다.`}
                info="현재 펀딩의 참여 인원이 가득 차서 참여할 수 없습니다"
                icon={<InfoIcon stroke="#FF5768" size={48} />}
                btnLabel="다른 펀딩 보기"
                subBtnLabel="확인"
                onBtnLabel={() => {
                  setFullCapacityDialogOpen(false);
                  window.location.href = '/category';
                }}
                onSubBtnLabel={() => setFullCapacityDialogOpen(false)}
              />
            )}
          </>
        ) : (
          // 이미 참여한 경우: 환불 확인 모달
          <>
            <Button variant="secondary" size="lg" textSize="lg" className="w-full" onClick={() => setRefundDialogOpen(true)}>
              참여 취소하기
            </Button>
            {refundDialogOpen && (
              <RefundConfirm 
                fundingId={fundingId} 
                userId={userId} 
                amount={price} 
                title={contextData.funding.title} 
                onClose={() => setRefundDialogOpen(false)}
                onSuccess={handleRefundComplete}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export { FundingActionSection };
export type { FundingActionSectionProps };
