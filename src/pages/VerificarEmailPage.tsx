import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api'
import { Spinner } from '@/components/ui'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

export function VerificarEmailPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const email = params.get('email') ?? ''
  const [loading, setLoading] = useState(false)
  const [reenvioAt, setReenvioAt] = useState<number | null>(null)

  const cooldownRestante = reenvioAt ? Math.max(0, 60 - Math.floor((Date.now() - reenvioAt) / 1000)) : 0

  async function handleReenviar() {
    if (cooldownRestante > 0) {
      toast.error(`Aguarde ${cooldownRestante}s antes de reenviar.`)
      return
    }
    setLoading(true)
    try {
      await authApi.reenviarConfirmacao({ email })
      setReenvioAt(Date.now())
      toast.success('E-mail reenviado! Verifique sua caixa de entrada.')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao reenviar e-mail.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
      <header style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px' }}>
        <ThemeToggle />
      </header>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '24px', boxShadow: 'var(--shadow)', padding: '48px 40px', maxWidth: '480px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 8px 24px rgba(0,212,170,0.15)' }}>
            <Mail size={28} color="var(--accent)" />
          </div>

          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.03em' }}>
            Confirme seu e-mail
          </h1>

          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '8px' }}>
            Enviamos um link de ativação para
          </p>
          {email && (
            <p style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '28px', fontFamily: 'var(--mono)' }}>
              {email}
            </p>
          )}

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '36px' }}>
            Clique no link do e-mail para ativar sua conta. Verifique também a pasta de spam.
          </p>

          <button
            type="button"
            disabled={loading || cooldownRestante > 0}
            onClick={handleReenviar}
            style={{
              width: '100%',
              padding: '14px',
              background: cooldownRestante > 0 ? 'var(--surface-2)' : 'var(--accent)',
              color: cooldownRestante > 0 ? 'var(--text-muted)' : '#04110d',
              border: cooldownRestante > 0 ? '1px solid var(--border)' : 'none',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: loading || cooldownRestante > 0 ? 'not-allowed' : 'pointer',
              fontFamily: 'var(--sans)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: loading ? 0.7 : 1,
              transition: 'all .2s',
            }}
          >
            {loading ? (
              <Spinner size={16} />
            ) : cooldownRestante > 0 ? (
              `Reenviar em ${cooldownRestante}s`
            ) : (
              'Reenviar e-mail de confirmação'
            )}
          </button>

          <p style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
            E-mail errado?{' '}
            <span
              style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }}
              onClick={() => navigate('/login')}
            >
              Voltar para o cadastro
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
