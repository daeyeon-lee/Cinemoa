import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RecentViewStore {
  recentViewIds: number[];
  addRecentView: (fundingId: number) => void;
  getRecentViewIds: () => number[];
  clearRecentViews: () => void;
}

export const useRecentViewStore = create<RecentViewStore>()(
  persist(
    (set, get) => ({
      recentViewIds: [],

      addRecentView: (fundingId: number) => {
        const currentIds = get().recentViewIds;
        // 중복 제거하고 맨 앞에 추가 (최신순)
        const updatedIds = [fundingId, ...currentIds.filter((id) => id !== fundingId)];
        // 최대 20개까지만 저장
        set({ recentViewIds: updatedIds.slice(0, 20) });
      },

      getRecentViewIds: () => get().recentViewIds,

      clearRecentViews: () => set({ recentViewIds: [] }),
    }),
    {
      name: 'recent-view-storage',
      partialize: (state) => ({ recentViewIds: state.recentViewIds }),
    },
  ),
);
