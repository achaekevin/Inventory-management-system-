import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '@/types'

interface AuthState {
  user: User | null
  token: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setTokens: (token: string, refreshToken: string) => void
  logout: () => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      setUser: (user) => 
        set({ 
          user, 
          isAuthenticated: !!user 
        }),

      setTokens: (token, refreshToken) => {
        localStorage.setItem('auth_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        set({ token, refreshToken, isAuthenticated: true })
      },

      logout: () => {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('refresh_token')
        set({ 
          user: null, 
          token: null, 
          refreshToken: null, 
          isAuthenticated: false 
        })
      },

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
