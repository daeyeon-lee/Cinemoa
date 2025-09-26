import React from 'react';
import PeopleIcon from '@/component/icon/peopleIcon';
import ClockIcon from '@/component/icon/clockIcon';

type StatItemProps = {
  icon: 'people' | 'time';
  text: string;
  loadingState?: 'ready' | 'loading';
  fill: string;
};

const StatItem: React.FC<StatItemProps> = ({ icon, text, loadingState = 'ready', fill }) => {
  if (loadingState === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-6 h-7 bg-gray-600 animate-pulse rounded" />
        <div className="h-5 w-24 bg-gray-600 animate-pulse rounded" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {icon === 'people' ? <PeopleIcon fill={fill} /> : <ClockIcon fill={fill} />}
      <div className="text-sm font-bold text-primary">{text}</div>
    </div>
  );
};

export { StatItem };
export type { StatItemProps };
