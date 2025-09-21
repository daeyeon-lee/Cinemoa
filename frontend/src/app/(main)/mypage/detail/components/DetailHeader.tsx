import React from 'react';

interface DetailHeaderProps {
  title: string;
  userNickname?: string;
  isLoading: boolean;
}

const DetailHeader: React.FC<DetailHeaderProps> = ({ title, userNickname, isLoading }) => {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
      <p className="text-slate-400">
        {isLoading ? '로딩 중...' : `${userNickname || '사용자'}님의 ${title.toLowerCase()}`}
      </p>
    </div>
  );
};

export default DetailHeader;
