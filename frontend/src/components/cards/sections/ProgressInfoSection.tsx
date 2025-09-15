import React from 'react';
import { StatItem } from '../primitives/StatItem';
import { Progress } from '../primitives/Progress';
import { Skeleton } from '@/components/ui/skeleton';

type ProgressInfoSectionProps = {
  type: 'funding' | 'vote';
  participantCount: number;
  likeCount: number;
  endDate: string;
  // 펀딩 전용
  progressRate?: number;
  maxPeople?: number;
  loadingState?: 'ready' | 'loading';
};

const ProgressInfoSection: React.FC<ProgressInfoSectionProps> = ({
  type,
  participantCount,
  likeCount,
  endDate,
  progressRate,
  maxPeople,
  loadingState = 'ready',
}) => {
  const calculateDaysLeft = (endDateString: string): number => {
    const endDateObj = new Date(endDateString);
    const now = new Date();
    const diffTime = endDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(endDate);

  const getParticipantText = (): string => {
    return type === 'funding'
      ? `${participantCount.toLocaleString()}명 참여`
      : `${likeCount.toLocaleString()}명이 보고 싶어해요`;
  };

  const getTimeText = (): string => {
    return type === 'funding' ? `${daysLeft}일 남음` : `${daysLeft}일 후 투표 종료`;
  };

  if (loadingState === 'loading') {
    return (
      <div className="flex flex-col justify-start items-start gap-3.5">
        <div className="self-stretch inline-flex justify-between items-center">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-7 w-24" />
        </div>
        {type === 'funding' && (
          <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
            <Skeleton className="self-stretch h-2.5 rounded-full" />
            <div className="self-stretch inline-flex justify-between items-start">
              <Skeleton className="h-7 w-12" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="self-stretch flex flex-col justify-start items-start gap-3.5">
      {/* 공통: 참여자수 + 남은시간 */}
      {type === 'vote' ? (
        <div className="self-stretch flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-1.5">
          <StatItem icon="people" text={getParticipantText()} loadingState={loadingState} />
          <StatItem icon="time" text={getTimeText()} loadingState={loadingState} />
        </div>
      ) : (
        <div className="self-stretch inline-flex justify-between items-center mt-1.5">
          <StatItem icon="people" text={getParticipantText()} loadingState={loadingState} />
          <StatItem icon="time" text={getTimeText()} loadingState={loadingState} />
        </div>
      )}

      {/* 펀딩 전용: 프로그래스 바 + 퍼센트 정보 */}
      {type === 'funding' && progressRate !== undefined && maxPeople !== undefined && (
        <div className="self-stretch flex flex-col justify-start items-start gap-1.5">
          <Progress value={progressRate} height={10} />
          <div className="self-stretch h-7 inline-flex justify-between items-start">
            <div className="self-stretch inline-flex flex-col justify-start items-start">
              <div className="justify-center h4 text-Brand1-Primary">{Math.round(progressRate)}%</div>
            </div>
            <div className="self-stretch inline-flex flex-col justify-start items-start">
              <div className="justify-center h6 text-tertiary">{maxPeople.toLocaleString()}명 모집</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ProgressInfoSection };
export type { ProgressInfoSectionProps };
