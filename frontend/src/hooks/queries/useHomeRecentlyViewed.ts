import { useQuery } from '@tanstack/react-query';
import { getRecentlyViewed } from '@/api/search';
import { ApiRecentlyViewedResponse } from '@/types/searchApi';
import { useAuthStore } from '@/stores/authStore';
import { useRecentViewStore } from '@/stores/recentViewStore';

export function useHomeRecentlyViewed() {
  const { user } = useAuthStore();
  const { recentViewIds } = useRecentViewStore();
  const userId = user?.userId;

  // 디버깅용 로그
  console.log('[useHomeRecentlyViewed] recentViewIds:', recentViewIds);
  console.log('[useHomeRecentlyViewed] userId:', userId);
  console.log('[useHomeRecentlyViewed] enabled:', recentViewIds.length > 0);

  return useQuery<ApiRecentlyViewedResponse, Error>({
    queryKey: ['recentlyViewed', recentViewIds],
    queryFn: () => getRecentlyViewed(recentViewIds.map(String), userId),
    enabled: recentViewIds.length > 0,
  });
}
