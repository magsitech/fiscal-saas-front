import { useEffect, useLayoutEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ProtectedRoute, PublicOnlyRoute } from '@/components/auth/ProtectedRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { LandingPage } from '@/pages/LandingPage'
import { AuthPage } from '@/pages/AuthPage'
import { DashboardPage } from '@/pages/DashboardPage'
import {
  ValidacoesPage, ConsumoPage, PagamentosPage,
  SimuladorPage, CreditosPage,
} from '@/pages/ManagementPages'
import { PerfilPage } from '@/pages/PerfilPage'
import { DocumentacaoPage } from '@/pages/DocumentacaoPage'
import { ConfirmarEmailPage } from '@/pages/ConfirmarEmailPage'
import { RedefinirSenhaPage } from '@/pages/RedefinirSenhaPage'
import { VerificarEmailPage } from '@/pages/VerificarEmailPage'
import { PrivacyPolicyPage, TermsOfServicePage } from '@/pages/LegalPages'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { resetWindowScroll } from '@/utils/scroll'
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

function ScrollManager() {
  const { pathname, search } = useLocation()

  useLayoutEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    const handlePageShow = () => {
      resetWindowScroll()
    }

    window.addEventListener('pageshow', handlePageShow)

    return () => {
      window.removeEventListener('pageshow', handlePageShow)

      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'auto'
      }
    }
  }, [])

  useLayoutEffect(() => {
    resetWindowScroll()

    const frameId = window.requestAnimationFrame(() => {
      resetWindowScroll()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [pathname, search])

  return null
}

function HomeRoute() {
  const { isAuthenticated, isBootstrapping } = useAuthStore()

  if (isBootstrapping) return null
  return isAuthenticated ? <Navigate to="/app" replace /> : <LandingPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <AppBootstrap />
      <ScrollManager />
      <Toaster position="bottom-right" toastOptions={{
        duration: 4000, style: ts,
        success: { iconTheme: { primary: '#00d4aa', secondary: '#000' }, style: { ...ts, borderLeft: '3px solid #00d4aa' } },
        error: { iconTheme: { primary: '#ef4444', secondary: '#fff' }, style: { ...ts, borderLeft: '3px solid #ef4444' } },
      }}
      />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/planos" element={<LandingPage />} />
        <Route path="/sobre" element={<LandingPage />} />
        <Route path="/contato" element={<LandingPage />} />
        <Route path="/pricing" element={<Navigate to="/planos" replace />} />
        <Route path="/termos-de-uso" element={<TermsOfServicePage />} />
        <Route path="/politica-de-privacidade" element={<PrivacyPolicyPage />} />
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
            <Route path="/app/documentacao" element={<DocumentacaoPage />} />
            <Route path="/app/validacoes" element={<Navigate to="/app/auditoria" replace />} />
            <Route path="/app/consumo" element={<Navigate to="/app/extrato" replace />} />
            <Route path="/app/pagamentos" element={<Navigate to="/app/pedidos" replace />} />
          </Route>
        </Route>
        <Route path="/verificar-email" element={<VerificarEmailPage />} />
        <Route path="/confirmar-email" element={<ConfirmarEmailPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
