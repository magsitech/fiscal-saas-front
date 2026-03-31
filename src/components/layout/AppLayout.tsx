import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Menu, Wifi } from 'lucide-react'
import { USE_MOCK_API } from '@/config/runtime'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const PAGE_TITLES: Record<string, string> = {
  '/app':             'Dashboard',
  '/app/validacoes':  'Histórico de Validações',
  '/app/consumo':     'Histórico de Consumo',
  '/app/creditos':    'Comprar Créditos',
  '/app/pagamentos':  'Pagamentos',
  '/app/simulador':   'Simulador de Custos',
  '/app/perfil':      'Meu Perfil',
}

export function AppLayout() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'validaeNota'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen app-shell">
      <Sidebar mobileOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
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
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <span className={`w-2 h-2 rounded-full animate-pulse ${USE_MOCK_API ? 'bg-[var(--warn)]' : 'bg-[var(--accent)]'}`} />
              <Wifi size={13} />
              {USE_MOCK_API ? 'modo demonstracao ativo' : 'API conectada'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto app-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
