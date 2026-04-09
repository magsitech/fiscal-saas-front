import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function PublicNav({ current }: { current: 'home' | 'pricing' }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  function go(path: '/' | '/pricing' | '/login') {
    setMobileOpen(false)
    navigate(path)
  }

  return (
    <>
      <nav
        className="landing-nav"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          padding: '0 40px',
          height: '60px',
          background: 'color-mix(in srgb, var(--surface) 92%, transparent)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div
          className="public-nav-desktop app-desktop-only"
          style={{
            position: 'relative',
            height: '100%',
            width: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                pointerEvents: 'auto',
              }}
            >
              <div className="landing-nav-links" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <PublicNavButton label="Home" active={current === 'home'} onClick={() => go('/')} />
                <PublicNavButton label="Preços" active={current === 'pricing'} onClick={() => go('/pricing')} />
              </div>

              <div className="landing-nav-cta">
                <button
                  onClick={() => go('/login')}
                  style={{
                    padding: '8px 20px',
                    background: 'var(--accent)',
                    color: '#04110d',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                  }}
                >
                  Área do Cliente
                </button>
              </div>
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <ThemeToggle />
          </div>
        </div>

        <div
          className="public-nav-mobile app-mobile-only"
          style={{
            position: 'relative',
            width: '100%',
            minHeight: '38px',
          }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen((value) => !value)}
            style={{
              border: '1px solid var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
              borderRadius: '999px',
              padding: '9px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '13px',
              fontWeight: 700,
            }}
            aria-label={mobileOpen ? 'Fechar menu da Área do Cliente' : 'Abrir menu da Área do Cliente'}
          >
            {mobileOpen ? <X size={16} /> : <Menu size={16} />}
            Área do Cliente
          </button>

          <div style={{ position: 'absolute', right: 0, top: 0 }}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div
          className="app-mobile-only"
          style={{
            position: 'sticky',
            top: '60px',
            zIndex: 95,
            padding: '12px 16px 0',
            background: 'var(--bg)',
          }}
        >
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '12px',
              boxShadow: 'var(--shadow)',
              display: 'grid',
              gap: '10px',
            }}
          >
            <button
              type="button"
              onClick={() => go('/login')}
              style={{
                width: '100%',
                border: 'none',
                borderRadius: '12px',
                background: 'var(--accent)',
                color: '#04110d',
                fontSize: '13px',
                fontWeight: 700,
                padding: '12px 14px',
                textAlign: 'left',
              }}
            >
              Área do Cliente
            </button>
            <div style={{ display: 'grid', gap: '6px' }}>
              <PublicMenuButton label="Home" active={current === 'home'} onClick={() => go('/')} />
              <PublicMenuButton label="Preços" active={current === 'pricing'} onClick={() => go('/pricing')} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function PublicNavButton({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '7px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        color: active ? 'var(--text)' : 'var(--text-muted)',
        background: active ? 'var(--surface-2)' : 'transparent',
        border: 'none',
        fontFamily: 'var(--sans)',
      }}
    >
      {label}
    </button>
  )
}

function PublicMenuButton({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        border: '1px solid transparent',
        borderRadius: '12px',
        background: active ? 'var(--accent-dim)' : 'var(--surface-2)',
        color: active ? 'var(--accent)' : 'var(--text)',
        fontSize: '13px',
        fontWeight: 600,
        padding: '11px 12px',
        textAlign: 'left',
      }}
    >
      {label}
    </button>
  )
}
