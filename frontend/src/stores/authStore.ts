import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useCardStore } from './cardStore';

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
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUserInfo: (updates: Partial<User>) => void;
  isLoggedIn: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,

      setUser: (user) =>
        set({
          user,
        }),

      clearUser: () => {
        set({
          user: null,
        });
        // 로그아웃 시 카드 정보도 함께 삭제
        useCardStore.getState().clearCards();
      },

      updateUserInfo: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      isLoggedIn: () => {
        const { user } = get();
        return !!user;
      },
    }),
    {
      name: 'auth-storage', // localStorage 키 이름
    },
  ),
);
