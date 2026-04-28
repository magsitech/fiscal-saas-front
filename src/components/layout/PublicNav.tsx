import { useEffect, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const SECTIONS = ['home', 'sobre', 'planos', 'contato'] as const
type Section = typeof SECTIONS[number]
const LABELS: Record<Section, string> = { home: 'Home', sobre: 'Sobre', planos: 'Planos', contato: 'Contato' }

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function PublicNav({ compact = false }: { compact?: boolean }) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [active, setActive] = useState<Section>('home')

  useEffect(() => {
    function onScroll() {
      const threshold = window.scrollY + window.innerHeight * 0.35
      let current: Section = 'home'
      for (const id of SECTIONS) {
        const el = document.getElementById(id)
        if (el && el.offsetTop <= threshold) current = id
      }
      setActive(current)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function go(id: Section) {
    setMobileOpen(false)
    scrollToSection(id)
  }

  function goLogin() {
    setMobileOpen(false)
    navigate('/login')
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
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          transition: 'background .3s',
        }}
      >
        <div
          className="public-nav-desktop app-desktop-only"
          style={{ position: 'relative', height: '100%', width: '100%' }}
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
              {!compact && (
                <div className="landing-nav-links" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  {SECTIONS.map(id => (
                    <PublicNavButton key={id} label={LABELS[id]} active={active === id} onClick={() => go(id)} />
                  ))}
                </div>
              )}

              <div className="landing-nav-cta">
                <button
                  onClick={goLogin}
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
                    transition: 'opacity .15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
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
          style={{ position: 'relative', width: '100%', minHeight: '38px' }}
        >
          {compact ? (
            <button
              type="button"
              onClick={goLogin}
              style={{
                border: 'none',
                background: 'var(--accent)',
                color: '#04110d',
                borderRadius: '8px',
                padding: '9px 14px',
                display: 'inline-flex',
                alignItems: 'center',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Área do Cliente
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMobileOpen(v => !v)}
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
                transition: 'background .15s',
              }}
              aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileOpen ? <X size={16} /> : <Menu size={16} />}
              Área do Cliente
            </button>
          )}

          <div style={{ position: 'absolute', right: 0, top: 0 }}>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {!compact && mobileOpen && (
        <div
          className="app-mobile-only"
          style={{
            position: 'sticky',
            top: '60px',
            zIndex: 95,
            padding: '12px 16px 0',
            background: 'var(--bg)',
            animation: 'fadeSlideDown .18s ease',
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
              onClick={goLogin}
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
                cursor: 'pointer',
              }}
            >
              Área do Cliente
            </button>
            <div style={{ display: 'grid', gap: '6px' }}>
              {SECTIONS.map(id => (
                <PublicMenuButton key={id} label={LABELS[id]} active={active === id} onClick={() => go(id)} />
              ))}
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
        transition: 'color .15s, background .15s',
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
        cursor: 'pointer',
        transition: 'background .15s, color .15s',
      }}
    >
      {label}
    </button>
  )
}
