import React from 'react';
import { CategoryBreadcrumb } from '../primitives/CategoryBreadcrumb';
import { Skeleton } from '@/components/ui/skeleton';
import { useFundingDetail } from '@/contexts/FundingDetailContext';

const ProjectInfoSection = () => {
  const { data } = useFundingDetail();
  const { category, screening, funding } = data;

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      <div className="flex flex-col justify-start items-start">
        <CategoryBreadcrumb categoryId={category.categoryId} />
      </div>

      <div className="w-full min-w-0">
        <div className="justify-center h3-b text-primary">{screening.videoName}</div>
      </div>

      <div className="w-full min-w-0">
        <div className="justify-center h6 text-secondary">{funding.title}</div>
      </div>
    </div>
  );
};

export { ProjectInfoSection };