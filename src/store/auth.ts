import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { Cliente } from '@/types'
import { USE_MOCK_API } from '@/config/runtime'
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from '@/utils/authStorage'

interface AuthState {
  usuario: Cliente | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isBootstrapping: boolean

  setTokens: (access: string, refresh: string) => void
  setUsuario: (u: Cliente) => void
  startBootstrap: () => void
  finishBootstrap: () => void
  syncTokensFromStorage: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isBootstrapping: true,

      setTokens: (access, refresh) => {
        setAuthTokens(access, refresh)
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        })
      },

      setUsuario: (u) => set({ usuario: u, isAuthenticated: true }),

      startBootstrap: () => set({ isBootstrapping: true }),

      finishBootstrap: () => set({ isBootstrapping: false }),

      syncTokensFromStorage: () => {
        const accessToken = getAccessToken()
        const refreshToken = getRefreshToken()
        set({
          accessToken,
          refreshToken,
          isAuthenticated: Boolean(accessToken || refreshToken),
        })
      },

      logout: () => {
        clearAuthTokens()
        if (USE_MOCK_API && typeof window !== 'undefined') {
          window.localStorage.removeItem('validaenota-mock-session')
        }
        set({
          usuario: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isBootstrapping: false,
        })
      },
    }),
    {
      name: 'validaenota-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (s) => ({
        usuario: s.usuario,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
