import React from 'react';
import { StatItem } from '../primitives/StatItem';
import { Progress } from '../primitives/Progress';
import { useFundingDetail } from '@/contexts/FundingDetailContext';


const ProgressInfoSection = () => {
  // Context에서 데이터 가져오기
  const { data } = useFundingDetail();
  const { funding, stat } = data;
  
  const participantCount = stat.participantCount;
  const endDate = funding.fundingEndsOn;
  const progressRate = funding.progressRate;
  const maxPeople = stat.maxPeople;
  const calculateDaysLeft = (endDateString: string): number => {
    const endDateObj = new Date(endDateString);
    const now = new Date();
    const diffTime = endDateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const daysLeft = calculateDaysLeft(endDate);


  return (
    <div className="w-full min-w-0 flex flex-col gap-3.5">
      {/* 참여자수 + 남은시간 */}
      <div className="w-full min-w-0 flex items-center justify-between mt-1.5">
        <div className="min-w-0">
          <StatItem icon="people" fill="#F53B3B" text={`${participantCount.toLocaleString()}명 참여`} />
        </div>
        <div className="min-w-0">
          <StatItem icon="time" fill="#F53B3B" text={`${daysLeft}일 남음`} />
        </div>
      </div>

      {/* 프로그래스 바 + 퍼센트 정보 */}
      <div className="w-full min-w-0 flex flex-col gap-1.5">
        <Progress value={progressRate} height={10} />

        <div className="w-full min-w-0 h-7 flex items-start justify-between">
          <div className="min-w-0">
            {/* ✅ 정수 그대로 출력 */}
            <div className="h4 text-Brand1-Primary">{progressRate}%</div>
          </div>
          <div className="min-w-0">
            <div className="h6 text-tertiary">{maxPeople.toLocaleString()}명 모집해요</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ProgressInfoSection };
