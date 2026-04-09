import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'

function AuthGate() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--sans)',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>Validando sessão</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Aguarde enquanto verificamos o ambiente e a autenticação.</div>
      </div>
    </div>
  )
}

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuthStore()
  if (isBootstrapping) return <AuthGate />
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrapping } = useAuthStore()
  if (isBootstrapping) return <AuthGate />
  return isAuthenticated ? <Navigate to="/app" replace /> : <Outlet />
}
