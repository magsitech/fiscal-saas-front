// AppShell — Sidebar + layout wrapper (staging branch)

const NAV_GROUPS = [
  { section: 'Principal', items: [
    { to: 'dashboard', label: 'Dashboard', icon: '▦' },
    { to: 'auditoria', label: 'Auditoria', icon: '📄' },
    { to: 'extrato', label: 'Extrato', icon: '📈' },
  ]},
  { section: 'Financeiro', items: [
    { to: 'credits', label: 'Créditos', icon: '💳' },
    { to: 'pedidos', label: 'Pedidos', icon: '🧾' },
    { to: 'simulador', label: 'Simulador', icon: '🧮' },
    { to: 'perfil', label: 'Perfil', icon: '👤' },
  ]},
  { section: 'Recursos', items: [
    { to: 'docs', label: 'Documentação', icon: '📖' },
  ]},
]

function Sidebar({ screen, navigate }) {
  return (
    <aside style={{ width: '230px', background: 'color-mix(in srgb, var(--surface) 94%, transparent)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, flexShrink: 0, backdropFilter: 'blur(16px)' }}>
      {/* Logo */}
      <div style={{ padding: '16px 14px 12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img src="../../assets/validaenota.png" alt="validaENota" style={{ width: '34px', height: '34px', objectFit: 'contain', flexShrink: 0 }} />
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.14em' }}>Painel do Cliente</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
        {NAV_GROUPS.map(group => (
          <div key={group.section} style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.16em', color: 'var(--text-dim)', padding: '8px 10px 6px' }}>
              {group.section}
            </div>
            {group.items.map(item => {
              const isActive = screen === item.to
              return (
                <button key={item.to} onClick={() => navigate(item.to)}
                  style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '14px', marginBottom: '4px', fontSize: '13px', fontWeight: 700, border: isActive ? '1px solid var(--accent-glow)' : '1px solid transparent', background: isActive ? 'var(--accent-dim)' : 'transparent', color: isActive ? 'var(--accent)' : 'var(--text-muted)', width: '100%', textAlign: 'left', fontFamily: 'var(--sans)', cursor: 'pointer', transition: 'all .16s' }}>
                  <span style={{ width: '30px', height: '30px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--surface-2) 88%, transparent)', border: '1px solid var(--border)', fontSize: '14px' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div style={{ padding: '10px 8px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ padding: '10px', borderRadius: '16px', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 92%, transparent), color-mix(in srgb, var(--surface) 96%, transparent))', border: '1px solid var(--border)', marginBottom: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700 }}>Empresa Demo LTDA</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>demo@empresa.com.br</div>
        </div>
        <button onClick={() => navigate('landing')} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '14px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', fontFamily: 'var(--sans)', width: '100%' }}>
          ↩ Sair da conta
        </button>
      </div>
    </aside>
  )
}

function AppHeader({ title, subtitle, badge, navigate }) {
  return (
    <div style={{ background: 'color-mix(in srgb, var(--surface) 90%, transparent)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border)', padding: '18px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-dim)', marginBottom: '4px' }}>
          {badge || 'Dashboard'}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', margin: 0 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px', margin: 0 }}>{subtitle}</p>}
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ padding: '4px 10px', borderRadius: '999px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--accent)', fontSize: '11px', fontWeight: 700 }}>staging</div>
      </div>
    </div>
  )
}

function AppShell({ screen, navigate, title, subtitle, badge, children }) {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)', fontFamily: 'var(--sans)', color: 'var(--text)' }} className="app-shell">
      <Sidebar screen={screen} navigate={navigate} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }} className="app-workspace">
        <AppHeader title={title} subtitle={subtitle} badge={badge} navigate={navigate} />
        <div style={{ flex: 1, overflowY: 'auto', padding: '28px 32px 40px' }} className="app-main">
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

Object.assign(window, { AppShell })
