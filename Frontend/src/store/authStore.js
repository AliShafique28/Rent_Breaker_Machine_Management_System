import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null, // 'admin' | 'staff' | 'customer'

      setAuth: (user, token, role) => set({ user, token, role }),
      logout: () => set({ user: null, token: null, role: null }),
    }),
    {
      name: 'rent-breaker-auth',
    }
  )
);
