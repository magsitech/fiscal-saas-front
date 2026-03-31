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

const ts = {
  background:'#111418', color:'#e8edf2',
  border:'1px solid #2a3340', borderRadius:'8px',
  fontSize:'13px', fontFamily:"'Space Grotesk',system-ui,sans-serif",
  boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" toastOptions={{ duration:4000, style:ts,
        success:{ iconTheme:{primary:'#00d4aa',secondary:'#000'}, style:{...ts,borderLeft:'3px solid #00d4aa'} },
        error:{ iconTheme:{primary:'#ef4444',secondary:'#fff'}, style:{...ts,borderLeft:'3px solid #ef4444'} },
      }}/>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<AuthPage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/validacoes" element={<ValidacoesPage />} />
            <Route path="/app/consumo" element={<ConsumoPage />} />
            <Route path="/app/creditos" element={<CreditosPage />} />
            <Route path="/app/pagamentos" element={<PagamentosPage />} />
            <Route path="/app/simulador" element={<SimuladorPage />} />
            <Route path="/app/perfil" element={<PerfilPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
