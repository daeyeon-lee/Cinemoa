import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../../api/category';

// React Query Hooks

// 카테고리 목록 조회
export const useGetCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    // staleTime: 5 * 60 * 1000, // 5분간 캐시
    // gcTime: 10 * 60 * 1000, // 10분간 가비지 컬렉션 방지
  });
};
