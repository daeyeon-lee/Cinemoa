import React from 'react';
import { CategoryBreadcrumb } from '../primitives/CategoryBreadcrumb';
import { Skeleton } from '@/components/ui/skeleton';

type ProjectInfoSectionProps = {
  categoryId?: number;
  movieTitle: string;
  projectTitle: string;
  type?: 'funding' | 'vote';
  loadingState?: 'ready' | 'loading';
};

const ProjectInfoSection: React.FC<ProjectInfoSectionProps> = ({
  categoryId,
  movieTitle,
  projectTitle,
  type = 'funding',
  loadingState = 'ready'
}) => {
  if (loadingState === 'loading') {
    return (
      <div className={`flex flex-col ${type === 'funding' ? 'gap-5' : 'gap-3'}`}>
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-4 w-full" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${type === 'funding' ? 'gap-5' : 'gap-3'}`}>
      <div className="self-stretch flex flex-col justify-start items-start">
        <CategoryBreadcrumb categoryId={categoryId} />
      </div>
      
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="justify-center text-white text-2xl font-bold font-['Pretendard'] leading-loose tracking-widest">
          {movieTitle}
        </div>
      </div>
      
      <div className="self-stretch flex flex-col justify-start items-start">
        <div className="self-stretch justify-center text-gray-300 text-base font-normal font-['Pretendard'] leading-normal tracking-wider">
          {projectTitle}
        </div>
      </div>
    </div>
  );
};

export { ProjectInfoSection };
export type { ProjectInfoSectionProps };