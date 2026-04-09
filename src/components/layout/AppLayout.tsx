import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { AlertTriangle, Menu, ShieldAlert, Wifi } from 'lucide-react'
import {
  API_BASE_URL,
  APP_ENV,
  ENVIRONMENT_LABEL,
  EXPECTED_FRONTEND_URL,
  USE_MOCK_API,
} from '@/config/runtime'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/auditoria': 'Histórico de Auditoria',
  '/app/extrato': 'Extrato Financeiro',
  '/app/creditos': 'Comprar Créditos',
  '/app/pedidos': 'Pedidos',
  '/app/simulador': 'Simulador de Custos',
  '/app/perfil': 'Meu Perfil',
}

const ENVIRONMENT_STYLES = {
  main: {
    dot: 'bg-[var(--accent)]',
    pillBg: 'rgba(0,212,170,.12)',
    pillBorder: '1px solid rgba(0,212,170,.28)',
    pillText: 'var(--accent)',
    label: 'Produção',
  },
  staging: {
    dot: 'bg-[var(--warn)]',
    pillBg: 'rgba(245,158,11,.12)',
    pillBorder: '1px solid rgba(245,158,11,.28)',
    pillText: 'var(--warn)',
    label: 'Staging',
  },
} as const

export function AppLayout() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'validaeNota'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const environmentUi = ENVIRONMENT_STYLES[APP_ENV]
  const environmentTitle = USE_MOCK_API
    ? `Mock ativo em ${ENVIRONMENT_LABEL}. Frontend: ${EXPECTED_FRONTEND_URL} | Backend configurado: ${API_BASE_URL}`
    : `${ENVIRONMENT_LABEL}. Frontend: ${EXPECTED_FRONTEND_URL} | Backend: ${API_BASE_URL}`

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {USE_MOCK_API && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(239,68,68,.12)',
              borderBottom: '1px solid rgba(239,68,68,.22)',
              color: 'var(--danger)',
              fontSize: '12px',
              fontWeight: 700,
              textAlign: 'center',
            }}
            title={environmentTitle}
          >
            <AlertTriangle size={14} />
            Modo mock ativo no ambiente {ENVIRONMENT_LABEL.toLowerCase()}. Não use este modo para validação final de produção.
          </div>
        )}

        <header className="h-14 px-8 flex items-center justify-between bg-[var(--surface)] border-b border-[var(--border)] shrink-0 app-header">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="app-mobile-only"
              onClick={() => setMobileMenuOpen(true)}
              style={{ border: '1px solid var(--border)', background: 'var(--surface-2)', color: 'var(--text)', borderRadius: '8px', padding: '8px', alignItems: 'center', justifyContent: 'center' }}
              aria-label="Abrir menu"
            >
              <Menu size={18} />
            </button>
            <h1 className="text-[15px] font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3 app-header-actions">
            <ThemeToggle />
            <div
              className="flex items-center gap-2 text-xs font-semibold rounded-full px-3 py-1.5"
              style={{
                background: USE_MOCK_API ? 'rgba(239,68,68,.12)' : environmentUi.pillBg,
                border: USE_MOCK_API ? '1px solid rgba(239,68,68,.28)' : environmentUi.pillBorder,
                color: USE_MOCK_API ? 'var(--danger)' : environmentUi.pillText,
              }}
              title={environmentTitle}
            >
              {USE_MOCK_API ? (
                <>
                  <ShieldAlert size={13} />
                  Mock ativo
                </>
              ) : (
                <>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${environmentUi.dot}`} />
                  <Wifi size={13} />
                  {environmentUi.label}
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto app-main">
          <Outlet />
        </main>

        <footer
          style={{
            borderTop: '1px solid var(--border)',
            padding: '20px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: '12px',
            background: 'var(--surface)',
          }}
        >
          © 2026 validaeNota. Plataforma de validação fiscal brasileira.
        </footer>
      </div>
    </div>
  )
}
