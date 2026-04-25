import type { MouseEvent as ReactMouseEvent } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Book,
  Calculator,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Receipt,
  Star,
  TrendingUp,
  User,
  X,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { resetWindowScroll } from '@/utils/scroll'

const NAV = [
  {
    section: 'Principal',
    items: [
      { to: '/app', label: 'Dashboard', icon: LayoutDashboard, end: true },
      { to: '/app/auditoria', label: 'Auditoria', icon: FileText },
      { to: '/app/extrato', label: 'Extrato', icon: TrendingUp },
      { to: '/app/perfil', label: 'Perfil', icon: User },
    ],
  },
  {
    section: 'Financeiro',
    items: [
      { to: '/app/creditos', label: 'Créditos', icon: CreditCard },
      { to: '/app/pedidos', label: 'Pedidos', icon: Receipt },
      { to: '/app/simulador', label: 'Simulador', icon: Calculator },
      { to: '/app/meu-plano', label: 'Meu Plano', icon: Star },
    ],
  },
  {
    section: 'Recursos',
    items: [
      { to: '/app/documentacao', label: 'Documentação', icon: Book },
    ],
  },
]

export function Sidebar({
  mobileOpen = false,
  onClose,
}: {
  mobileOpen?: boolean
  onClose?: () => void
}) {
  const { pathname } = useLocation()
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  function goTo(event: ReactMouseEvent<HTMLButtonElement>, to: string) {
    event.currentTarget.blur()
    onClose?.()

    if (to === pathname) {
      resetWindowScroll()
      return
    }

    navigate(to)
  }

  function isRouteActive(to: string, end?: boolean) {
    if (end) return pathname === to
    return pathname === to || pathname.startsWith(`${to}/`)
  }

  function handleLogout() {
    logout()
    toast.success('Sessão encerrada')
    onClose?.()
    navigate('/')
  }

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="app-sidebar-backdrop app-mobile-only"
          onClick={onClose}
          aria-label="Fechar menu"
          style={{ border: 'none' }}
        />
      )}

      <aside
        className={`app-sidebar ${mobileOpen ? 'is-open' : ''}`}
        style={{
          width: '230px',
          background: 'color-mix(in srgb, var(--surface) 94%, transparent)',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          backdropFilter: 'blur(16px)',
        }}
      >
        <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              className="app-mobile-only"
              onClick={onClose}
              style={{
                border: '1px solid var(--border)',
                background: 'var(--surface-2)',
                color: 'var(--text)',
                borderRadius: '10px',
                padding: '6px',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="Fechar menu"
            >
              <X size={14} />
            </button>

            <div
              style={{
                width: '34px',
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <img
                src="/validaenota.png"
                alt="ValidaeNota"
                style={{ width: '34px', height: '34px', objectFit: 'contain', display: 'block' }}
              />
            </div>

            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '.14em',
                    lineHeight: 1.3,
                  }}
                >
                  Painel do Cliente
                </div>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {NAV.map((group) => (
            <div key={group.section} style={{ marginBottom: '12px' }}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '.16em',
                  color: 'var(--text-dim)',
                  padding: '8px 10px 6px',
                }}
              >
                {group.section}
              </div>

              {group.items.map(({ to, label, icon: Icon, end }) => {
                const isActive = isRouteActive(to, end)

                return (
                  <button
                    key={to}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => goTo(event, to)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '14px',
                      marginBottom: '4px',
                      fontSize: '13px',
                      fontWeight: 700,
                      transition: 'all .16s ease',
                      border: isActive ? '1px solid var(--accent-glow)' : '1px solid transparent',
                      background: isActive ? 'var(--accent-dim)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                      width: '100%',
                      textAlign: 'left',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'color-mix(in srgb, var(--surface-2) 88%, transparent)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Icon size={14} style={{ flexShrink: 0 }} />
                      </span>
                      <span>{label}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              padding: '10px',
              borderRadius: '16px',
              background:
                'linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 92%, transparent), color-mix(in srgb, var(--surface) 96%, transparent))',
              border: '1px solid var(--border)',
              marginBottom: '8px',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  lineHeight: 1.2,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {usuario?.nome ?? '-'}
              </div>
              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {usuario?.email ?? ''}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '14px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--text-muted)',
              background: 'transparent',
              border: '1px solid var(--border)',
              fontFamily: 'var(--sans)',
              width: '100%',
              transition: 'all .16s ease',
            }}
            onMouseEnter={(event) => {
              const element = event.currentTarget as HTMLElement
              element.style.color = 'var(--danger)'
              element.style.background = 'rgba(239,68,68,.08)'
              element.style.borderColor = 'rgba(239,68,68,.18)'
            }}
            onMouseLeave={(event) => {
              const element = event.currentTarget as HTMLElement
              element.style.color = 'var(--text-muted)'
              element.style.background = 'transparent'
              element.style.borderColor = 'var(--border)'
            }}
          >
            <LogOut size={14} style={{ flexShrink: 0 }} />
            Sair da conta
          </button>
        </div>
      </aside>
    </>
  )
}
