import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Wifi } from 'lucide-react'

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

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 px-8 flex items-center justify-between bg-[var(--surface)] border-b border-[var(--border)] shrink-0">
          <h1 className="text-[15px] font-semibold">{title}</h1>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <Wifi size={13} />
            API conectada
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
