import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  userId: number;
  email: string;
  isAnonymous: boolean;
  preferences?: {
    movie: string[];
    series: string[];
    performance: string[];
    sports: string[];
  };
}

interface AuthStore {
  user: User | null;
  accessToken: string | null; // 🆕 토큰 추가
  setUser: (user: User, token?: string) => void;
  clearUser: () => void;
  updateUserInfo: (updates: Partial<User>) => void;
  isLoggedIn: boolean; // 함수에서 boolean으로 변경
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null, // 🆕 토큰 초기값

      setUser: (user, token) => set({ user, accessToken: token || null, isLoggedIn: true }),

      clearUser: () => set({ user: null, accessToken: null, isLoggedIn: false }),

      updateUserInfo: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      isLoggedIn: false, // 초기값
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
      // 선택적으로 특정 필드만 저장
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      // 🆕 초기 상태를 localStorage에서 가져오기
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isLoggedIn = !!(state.user && state.accessToken);
        }
      },
    },
  ),
);