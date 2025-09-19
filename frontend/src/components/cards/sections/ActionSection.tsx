import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Payment from '@/app/payment/Payment';
import { HeartIcon } from '@/component/icon/heartIcon';
import LinkIcon from '@/component/icon/linkIcon';
import { useFundingLike } from '@/hooks/queries';
import { useAuthStore } from '@/stores/authStore';

type ActionSectionProps = {
  type: 'funding' | 'vote';
  // 펀딩 전용
  price?: number;
  likeCount?: number;
  isLiked?: boolean;
  isParticipated?: boolean;  // 🆕 참여 여부 (기본값 false = 참여 가능)
  fundingId?: number;        // 🆕 React Query용 추가
  // 공통 액션 핸들러
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  loadingState?: 'ready' | 'loading';
};

const ActionSection: React.FC<ActionSectionProps> = ({
  type,
  price,
  likeCount = 0,
  isLiked = false,
  isParticipated = false,   // 🆕 기본값 false (참여 가능)
  fundingId,              // 🆕 추가
  onPrimaryAction,
  onSecondaryAction,
  loadingState = 'ready',
}) => {
  // 🆕 React Query 훅 사용
  const { user } = useAuthStore();
  const userId = user?.userId?.toString();
  const likeMutation = useFundingLike();
  
  // 🐛 authStore 디버깅 로그
  console.log('=== AuthStore Debug ===');
  console.log('user:', user);
  console.log('user?.userId:', user?.userId);
  console.log('userId (toString):', userId);
  console.log('fundingId:', fundingId);
  console.log('isLiked:', isLiked);
  console.log('======================');
  
  // 🆕 좋아요 클릭 핸들러
  const handleLikeClick = () => {
    if (!userId || !fundingId) {
      alert('로그인 후 이용해주세요.');
      return;
    }
    
    likeMutation.mutate({
      fundingId,
      userId,
      isLiked
    });
  };
  if (loadingState === 'loading') {
    return (
      <div className={`flex flex-col mt-5 gap-${type === 'funding' ? '4' : '6'}`}>
        {type === 'funding' && (
          <div className="inline-flex justify-between items-center">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-16" />
          </div>
        )}
        <div className="inline-flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col pt-5 border-t border-slate-600 gap-${type === 'funding' ? '4' : '6'}`}>
      {/* 펀딩: 가격 정보 */}
      {type === 'funding' && price !== undefined && (
        <div className="w-full inline-flex justify-between items-center">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center h6 text-tertiary">1인당</div>
          </div>
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center h5-b text-primary">{price.toLocaleString()}원</div>
          </div>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="w-full inline-flex justify-start items-center gap-2">
        {type === 'funding' ? (
          <>
            {/* 펀딩 */}
            {/* 좋아요 버튼 */}
            <Button
              variant="outline"
              size="lg"
              textSize="lg"
              className={`${
                isLiked
                  ? 'h5-b border-Brand1-Strong text-Brand1-Strong gap-1 hover:border-Brand1-Strong hover:text-Brand1-Strong'
                  : 'h5-b gap-1'
              }`}
              onClick={fundingId ? handleLikeClick : onPrimaryAction} // 🆕 React Query 우선 사용
              disabled={likeMutation.isPending} // 🆕 로딩 상태 반영
            >
              <HeartIcon stroke={isLiked ? '#FF5768' : '#94A3B8'} />
              {likeCount}
            </Button>

            {/* 참여하기 버튼 -> 결제로 이동(모달 형태)*/}
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="brand1" 
                  size="lg" 
                  textSize="lg" 
                  className="w-full"
                  disabled={isParticipated} // 🆕 참여했으면 비활성화
                >
                  {isParticipated ? '참여완료' : '참여하기'}
                </Button>
              </DialogTrigger>
              <Payment 
                fundingId={fundingId}
                userId={userId}
                amount={price}
              />
            </Dialog>
          </>
        ) : (
          <>
            {/* 투표 */}
            {/* 보고싶어요 버튼 */}
            <Button
              variant="outline"
              size="lg"
              textSize="lg"
              onClick={onPrimaryAction}
              className={`${
                isLiked
                  ? 'w-full h5-b border-Brand2-Strong text-Brand2-Strong gap-1 hover:border-Brand2-Strong hover:text-Brand2-Strong'
                  : 'w-full h5-b gap-1'
              }`}
            >
              <HeartIcon stroke={isLiked ? '#71E5DE' : '#94A3B8'} />
              보고 싶어요
            </Button>

            {/* 공유 버튼 */}
            <Button variant="outline" size="lg" textSize="lg" onClick={onSecondaryAction}>
              <LinkIcon />
              공유
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export { ActionSection };
export type { ActionSectionProps };
