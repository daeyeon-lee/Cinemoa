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
  isLoggedIn: boolean;

  // Actions
  setUser: (user: User) => void;
  clearUser: () => void;
  updateUserInfo: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,

      setUser: (user) =>
        set({
          user,
          isLoggedIn: true,
        }),

      clearUser: () =>
        set({
          user: null,
          isLoggedIn: false,
        }),

      updateUserInfo: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
    }),
    {
      name: 'auth-storage', // localStorage 키
    },
  ),
);
