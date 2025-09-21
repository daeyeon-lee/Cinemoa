import React from 'react';

interface LoadingIndicatorProps {
  isLoadingMore: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoadingMore }) => {
  if (!isLoadingMore) return null;

  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-slate-400">더 불러오는 중...</div>
    </div>
  );
};

interface NoMoreDataProps {
  hasNextPage: boolean;
  dataLength: number;
}

export const NoMoreData: React.FC<NoMoreDataProps> = ({ hasNextPage, dataLength }) => {
  if (hasNextPage || dataLength === 0) return null;

  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-slate-500 text-sm">모든 데이터를 불러왔습니다.</div>
    </div>
  );
};

interface InitialLoadingProps {
  isLoading: boolean;
}

export const InitialLoading: React.FC<InitialLoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-slate-400">로딩 중...</div>
    </div>
  );
};

