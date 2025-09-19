import React from 'react';
import { CategoryBreadcrumb } from '../primitives/CategoryBreadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

type ProjectInfoSectionProps = {
  categoryId?: number;
  movieTitle: string;
  projectTitle: string;
  type?: 'FUNDING' | 'VOTE';
  loadingState?: 'ready' | 'loading';
};

const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  categoryId,
  movieTitle,
  projectTitle,
  type = 'FUNDING',
  loadingState = 'ready',
}) => {
  if (loadingState === 'loading') {
    return (
      <div className={`flex flex-col ${type === 'FUNDING' ? 'gap-4' : 'gap-3'}`}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <div className="flex flex-col justify-start items-start">
        <CategoryBreadcrumb categoryId={categoryId} />
      </div>

      <div className="w-full min-w-0">
        <div className="justify-center h3-b text-primary">{movieTitle}</div>
      </div>

      <div className="w-full min-w-0">
        <div className="justify-center h6 text-secondary">{projectTitle}</div>
      </div>
    </div>
  );
};

export { ProjectInfoSection };
export type { ProjectInfoSectionProps };
