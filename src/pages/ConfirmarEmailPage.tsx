import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle } from 'lucide-react'
import { authApi } from '@/services/api'
import { Spinner } from '@/components/ui'

export function ConfirmarEmailPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'ok' | 'erro'>('loading')
  const [mensagem, setMensagem] = useState('')

  useEffect(() => {
    const token = params.get('token')
    if (!token) {
      setStatus('erro')
      setMensagem('Token não encontrado.')
      return
    }
    authApi.confirmarEmail(token)
      .then((res) => {
        setMensagem(res.mensagem ?? 'E-mail confirmado com sucesso!')
        setStatus('ok')
      })
      .catch((err) => {
        setMensagem(err?.response?.data?.detail ?? 'Link inválido ou expirado.')
        setStatus('erro')
      })
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--sans)' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '22px', boxShadow: 'var(--shadow)', padding: '40px 36px', maxWidth: '420px', width: '100%', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <Spinner size={32} />
            <p style={{ color: 'var(--text-muted)', marginTop: '16px', fontSize: '14px' }}>Confirmando seu e-mail…</p>
          </>
        )}

        {status === 'ok' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={26} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em' }}>E-mail confirmado!</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>{mensagem}</p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              Fazer login
            </button>
          </>
        )}

        {status === 'erro' && (
          <>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'color-mix(in srgb, var(--danger) 15%, transparent)', border: '1px solid color-mix(in srgb, var(--danger) 30%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <XCircle size={26} color="var(--danger)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em' }}>Link inválido</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>{mensagem}</p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '12px', background: 'var(--surface-2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              Voltar para o login
            </button>
          </>
        )}
      </div>
    </div>
  )
}
