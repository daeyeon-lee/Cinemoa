import React from 'react';

type StatItemProps = {
  icon: 'people' | 'time';
  text: string;
  loadingState?: 'ready' | 'loading';
};

const StatItem: React.FC<StatItemProps> = ({ icon, text, loadingState = 'ready' }) => {
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
      return (
        <div className="w-6 h-7 relative">
          <div className="w-5 h-4 left-[1.32px] top-[6.22px] absolute bg-Brand2-Strong" />
        </div>
      );
    } else if (icon === 'time') {
      return (
        <div className="w-6 h-7 relative">
          <div className="w-5 h-5 left-[3px] top-[1.99px] absolute bg-Brand2-Strong" />
        </div>
      );
    }
  };

  return (
    <div className="flex justify-start items-center gap-2">
      <div className="inline-flex flex-col justify-start items-start">
        {renderIcon()}
      </div>
      <div className="inline-flex flex-col justify-start items-start">
        <div className="justify-center text-white text-lg font-bold font-['Pretendard'] leading-7">
          {text}
        </div>
      </div>
    </div>
  );
};

export { StatItem };
export type { StatItemProps };