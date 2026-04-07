import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario } from '@/types'
import { USE_MOCK_API } from '@/config/runtime'

interface AuthState {
  usuario: Usuario | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean

  setTokens: (access: string, refresh: string) => void
  setUsuario: (u: Usuario) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setTokens: (access, refresh) => {
        localStorage.setItem('access_token', access)
        localStorage.setItem('refresh_token', refresh)
        set({ accessToken: access, refreshToken: refresh, isAuthenticated: true })
      },

      setUsuario: (u) => set({ usuario: u }),

      logout: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        if (USE_MOCK_API) localStorage.removeItem('validaenota-mock-session')
        set({ usuario: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },
    }),
    {
      name: 'validaenota-auth',
      partialize: (s) => ({
        usuario: s.usuario,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
)
