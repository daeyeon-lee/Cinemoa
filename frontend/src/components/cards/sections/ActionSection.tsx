import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Payment from '@/app/payment/Payment';
import HeartIcon from '@/component/icon/heartIcon';

type ActionSectionProps = {
  type: 'funding' | 'vote';
  // 펀딩 전용
  price?: number;
  likeCount?: number;
  isLiked?: boolean;
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
  onPrimaryAction,
  onSecondaryAction,
  loadingState = 'ready',
}) => {
  if (loadingState === 'loading') {
    return (
      <div
        className={`px-4 py-4 bg-slate-800 border-t border-gray-700 flex flex-col gap-${
          type === 'funding' ? '4' : '6'
        }`}
      >
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
    <div
      className={`px-4 py-4 bg-slate-800 border-t border-gray-700 flex flex-col gap-${type === 'funding' ? '4' : '6'}`}
    >
      {/* 펀딩: 가격 정보 */}
      {type === 'funding' && price !== undefined && (
        <div className="self-stretch inline-flex justify-between items-center">
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center h6 text-tertiary">1인당</div>
          </div>
          <div className="inline-flex flex-col justify-start items-start">
            <div className="justify-center h5-b text-primary">{price.toLocaleString()}원</div>
          </div>
        </div>
      )}

      {/* 버튼 영역 */}
      <div className="self-stretch inline-flex justify-start items-center gap-2">
        {type === 'funding' ? (
          <>
            {/* 좋아요 버튼 */}
            <Button
              variant="outline"
              size="lg"
              className={`${
                isLiked
                  ? 'h5-b border-Brand1-Strong text-Brand1-Strong gap-1 hover:border-Brand1-Strong hover:text-Brand1-Strong'
                  : 'h5-b gap-1'
              }`}
              onClick={onPrimaryAction}
            >
              <HeartIcon stroke={isLiked ? '#FF5768' : '#94A3B8'} />
              좋아요
            </Button>

            {/* 참여하기 버튼 -> 결제로 이동(모달 형태)*/}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="brand1" size="lg" className="w-full">
                  참여하기
                </Button>
              </DialogTrigger>
              <Payment />
            </Dialog>
          </>
        ) : (
          <>
            {/* 보고싶어요 버튼 */}
            <Button variant="brand2" className="flex-1 px-5 py-2 rounded-md" onClick={onPrimaryAction}>
              <div className="justify-start text-slate-900 text-lg font-bold font-['Pretendard'] leading-7">
                보고싶어요
              </div>
            </Button>

            {/* 공유 버튼 */}
            <div
              className="w-24 pl-3 pr-4 py-2 rounded-md outline outline-1 outline-offset-[-1px] outline-slate-700 flex justify-center items-center gap-1 cursor-pointer"
              onClick={onSecondaryAction}
            >
              <div className="w-4 h-4 relative overflow-hidden">
                <div className="w-3.5 h-3.5 left-[2.21px] top-[2.29px] absolute outline outline-2 outline-offset-[-1px] outline-slate-400" />
              </div>
              <div className="justify-start text-slate-400 text-lg font-bold font-['Pretendard'] leading-7">공유</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export { ActionSection };
export type { ActionSectionProps };
