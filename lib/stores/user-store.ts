import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/models/user'

interface UserState {
  currentUser: User | null
  isLoading: boolean
  error: string | null
  setCurrentUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearUser: () => void
  updateUserRole: (role: 'admin' | 'client') => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      isLoading: false,
      error: null,
      setCurrentUser: (user) => set({ currentUser: user, error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      clearUser: () => set({ currentUser: null, error: null }),
      updateUserRole: (role) =>
        set((state) => ({
          currentUser: state.currentUser
            ? { ...state.currentUser, role }
            : null,
        })),
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ currentUser: state.currentUser }),
    }
  )
)