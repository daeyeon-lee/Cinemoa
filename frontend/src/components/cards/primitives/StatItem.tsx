import React from 'react';
import PeopleIcon from '@/component/icon/peopleIcon';
import ClockIcon from '@/component/icon/clockIcon';

type StatItemProps = {
  icon: 'people' | 'time';
  text: string;
  loadingState?: 'ready' | 'loading';
  fill: string;
};

const StatItem: React.FC<StatItemProps> = ({ icon, text, loadingState = 'ready', fill}) => {
  if (loadingState === 'loading') {
    return (
      <div className="flex justify-start items-center gap-2">
        <div className="w-6 h-7 bg-gray-600 animate-pulse rounded" />
        <div className="h-5 w-24 bg-gray-600 animate-pulse rounded" />
      </div>
    );
  }

  const renderIcon = () => {
    if (icon === 'people') {
      return <PeopleIcon fill={fill} />;
    } else if (icon === 'time') {
      return <ClockIcon fill={fill} />;
    }
  };

  return (
    <div className="flex justify-start items-center gap-2">
      <div className="inline-flex flex-col justify-start items-start">{renderIcon()}</div>
      <div className="inline-flex flex-col justify-start items-start">
        <div className="justify-center h5-b text-primary">{text}</div>
      </div>
    </div>
  );
};

export { StatItem };
export type { StatItemProps };
