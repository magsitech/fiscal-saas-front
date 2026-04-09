import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { PricingPage } from '@/pages/PricingPage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import {
  ValidacoesPage, ConsumoPage, PagamentosPage,
  SimuladorPage, CreditosPage,
} from '@/pages/ManagementPages'
import { PerfilPage } from '@/pages/PerfilPage'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { getAccessToken, getRefreshToken } from '@/utils/authStorage'

const ts = {
  background: '#111418', color: '#e8edf2',
  border: '1px solid #2a3340', borderRadius: '8px',
  fontSize: '13px', fontFamily: "'Space Grotesk',system-ui,sans-serif",
  boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
}

function AppBootstrap() {
  const {
    setUsuario,
    logout,
    startBootstrap,
    finishBootstrap,
    syncTokensFromStorage,
  } = useAuthStore()

  useEffect(() => {
    let active = true

    async function bootstrap() {
      startBootstrap()
      syncTokensFromStorage()

      const hasAccessToken = Boolean(getAccessToken())
      const hasRefreshToken = Boolean(getRefreshToken())

      if (!hasAccessToken && !hasRefreshToken) {
        if (active) finishBootstrap()
        return
      }

      try {
        const me = await authApi.me()
        if (!active) return
        setUsuario(me)
      } catch {
        if (!active) return
        logout()
      } finally {
        if (active) finishBootstrap()
      }
    }

    bootstrap()

    return () => {
      active = false
    }
  }, [finishBootstrap, logout, setUsuario, startBootstrap, syncTokensFromStorage])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBootstrap />
      <Toaster position="bottom-right" toastOptions={{
        duration: 4000, style: ts,
        success: { iconTheme: { primary: '#00d4aa', secondary: '#000' }, style: { ...ts, borderLeft: '3px solid #00d4aa' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' }, style: { ...ts, borderLeft: '3px solid #ef4444' } },
      }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/auditoria" element={<ValidacoesPage />} />
            <Route path="/app/extrato" element={<ConsumoPage />} />
            <Route path="/app/creditos" element={<CreditosPage />} />
            <Route path="/app/pedidos" element={<PagamentosPage />} />
            <Route path="/app/simulador" element={<SimuladorPage />} />
            <Route path="/app/perfil" element={<PerfilPage />} />
            <Route path="/app/validacoes" element={<Navigate to="/app/auditoria" replace />} />
            <Route path="/app/consumo" element={<Navigate to="/app/extrato" replace />} />
            <Route path="/app/pagamentos" element={<Navigate to="/app/pedidos" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
