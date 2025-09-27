import React from 'react';
import { Button } from '@/components/ui/button';

type SectionType = 'proposals' | 'participated' | 'liked';

interface EmptyStateProps {
  title: string;
  section: SectionType;
  onActionClick: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, section, onActionClick }) => {
  const getActionText = () => {
    switch (section) {
      case 'proposals':
        return '만들기로 이동';
      case 'participated':
        return '홈페이지로 이동';
      case 'liked':
        return '상영회 보러가기';
      default:
        return '상영회 보러가기';
    }
  };

  const getDescription = () => {
    switch (section) {
      case 'proposals':
        return '프로젝트를 시작해보세요';
      case 'participated':
        return '상영회에 참여해보세요';
      case 'liked':
        return '보고 싶은 상영회를 저장해보세요';
      default:
        return '보고 싶은 상영회를 저장해보세요';
    }
  };

  return (
    <div className="flex flex-col justify-center items-center h-64 gap-4">
      <div className="text-center">
        <div className="text-slate-400 text-lg font-medium mb-2">{title}가 없습니다</div>
        <div className="text-slate-500 text-sm">{getDescription()}</div>
      </div>
      <Button onClick={onActionClick} className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
        {getActionText()}
      </Button>
    </div>
  );
};

export default EmptyState;
