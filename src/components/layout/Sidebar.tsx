import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, FileText, TrendingUp, CreditCard,
  Receipt, Calculator, User, LogOut,
} from 'lucide-react'
import { useAuthStore } from '@/store/auth'
import toast from 'react-hot-toast'

const NAV = [
  { section: 'Principal', items: [
    { to: '/app',            label: 'Dashboard',        icon: LayoutDashboard, end: true },
    { to: '/app/validacoes', label: 'Validações',       icon: FileText },
    { to: '/app/consumo',    label: 'Consumo',          icon: TrendingUp },
  ]},
  { section: 'Financeiro', items: [
    { to: '/app/creditos',   label: 'Comprar Créditos', icon: CreditCard },
    { to: '/app/pagamentos', label: 'Pagamentos',       icon: Receipt },
    { to: '/app/simulador',  label: 'Simulador',        icon: Calculator },
    { to: '/app/perfil',     label: 'Meu Perfil',       icon: User },
  ]},
]

export function Sidebar() {
  const { usuario, logout } = useAuthStore()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    toast.success('Sessão encerrada')
    navigate('/')
  }

  const initials = usuario?.nome
    ?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() ?? 'U'

  return (
    <aside style={{ width:'196px', background:'var(--surface)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, flexShrink:0 }}>

      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'9px', padding:'16px 12px', borderBottom:'1px solid var(--border)' }}>
        <div style={{ width:'28px', height:'28px', background:'var(--accent)', borderRadius:'7px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:'10px', fontWeight:700, color:'#000', letterSpacing:'-.3px', flexShrink:0 }}>VN</div>
        <div>
          <div style={{ fontSize:'12px', fontWeight:700, lineHeight:1.2 }}>validaeNota</div>
          <div style={{ fontSize:'9px', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.4px', marginTop:'2px' }}>Painel do Gestor</div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:'8px 6px', overflowY:'auto' }}>
        {NAV.map(group => (
          <div key={group.section}>
            <div style={{ fontSize:'9px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', padding:'8px 7px 3px' }}>
              {group.section}
            </div>
            {group.items.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:'8px',
                  padding:'7px 8px', borderRadius:'7px', marginBottom:'2px',
                  fontSize:'12px', fontWeight:500, textDecoration:'none',
                  transition:'all .14s', border:'1px solid transparent',
                  background: isActive ? 'var(--accent-dim)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                  borderColor: isActive ? 'var(--accent-glow)' : 'transparent',
                })}
              >
                <Icon size={13} style={{ flexShrink:0 }} />
                {label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div style={{ padding:'8px 6px', borderTop:'1px solid var(--border)' }}>
        {/* User chip */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 8px', borderRadius:'7px', background:'var(--surface-2)', marginBottom:'6px' }}>
          <div style={{ width:'24px', height:'24px', borderRadius:'50%', background:'linear-gradient(135deg,var(--accent),var(--info))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', fontWeight:700, color:'#000', flexShrink:0 }}>
            {initials}
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ fontSize:'11px', fontWeight:700, lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{usuario?.nome ?? '—'}</div>
            <div style={{ fontSize:'10px', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{usuario?.email ?? ''}</div>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          style={{ display:'flex', alignItems:'center', gap:'7px', padding:'7px 8px', borderRadius:'7px', cursor:'pointer', fontSize:'12px', fontWeight:600, color:'var(--text-muted)', background:'none', border:'1px solid transparent', fontFamily:'var(--sans)', width:'100%', transition:'all .14s' }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color='var(--danger)'; el.style.background='rgba(239,68,68,.08)'; el.style.borderColor='rgba(239,68,68,.15)' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color='var(--text-muted)'; el.style.background='none'; el.style.borderColor='transparent' }}
        >
          <LogOut size={13} style={{ flexShrink:0 }} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
