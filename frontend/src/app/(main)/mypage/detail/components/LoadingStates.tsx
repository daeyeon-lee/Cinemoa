import React from 'react';

interface LoadingIndicatorProps {
  isLoadingMore: boolean;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ isLoadingMore }) => {
  if (!isLoadingMore) return null;

  return (
    <div className="flex justify-center items-center py-8">
      <div className="text-tertiary caption1">로딩중...</div>
    </div>
  );
};

interface NoMoreDataProps {
  hasNextPage: boolean;
  dataLength: number;
}

export const NoMoreData: React.FC<NoMoreDataProps> = ({ hasNextPage, dataLength }) => {
  return null;
};

interface InitialLoadingProps {
  isLoading: boolean;
}

export const InitialLoading: React.FC<InitialLoadingProps> = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="flex justify-center items-center h-64">
      <div className="text-tertiary">로딩 중...</div>
    </div>
  );
};
