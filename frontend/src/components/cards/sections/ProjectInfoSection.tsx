import React from 'react';
import { CategoryBreadcrumb } from '../primitives/CategoryBreadcrumb';

// 타입별 Context hook을 Props로 받는 방식으로 변경
type ProjectInfoSectionProps = {
  type: 'FUNDING' | 'VOTE';
  categoryId: number;
  videoName: string;
  title: string;
};

const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  categoryId,
  videoName,
  title
}) => {

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <div className="flex flex-col justify-start items-start">
        <CategoryBreadcrumb categoryId={categoryId} />
      </div>

      <div className="w-full min-w-0">
        <div className="justify-center h3-b text-primary">{videoName}</div>
      </div>

      <div className="w-full min-w-0">
        <div className="justify-center h6 text-secondary">{title}</div>
      </div>
    </div>
  );
};

export { ProjectInfoSection };