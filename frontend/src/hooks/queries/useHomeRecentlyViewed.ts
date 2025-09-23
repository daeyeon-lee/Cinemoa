import { useQuery } from '@tanstack/react-query';
import { getRecentlyViewed } from '@/api/user';
import { ApiRecentlyViewedResponse } from '@/types/searchApi';
import { useAuthStore } from '@/stores/authStore';
import { useRecentViewStore } from '@/stores/recentViewStore';

export function useHomeRecentlyViewed() {
  const { user } = useAuthStore();
  const { recentViewIds } = useRecentViewStore();
  const userId = user?.userId;

  return useQuery<ApiRecentlyViewedResponse, Error>({
    queryKey: ['recentlyViewed', recentViewIds],
    queryFn: () => getRecentlyViewed(recentViewIds.map(String), userId),
    enabled: recentViewIds.length > 0,
  });
}
