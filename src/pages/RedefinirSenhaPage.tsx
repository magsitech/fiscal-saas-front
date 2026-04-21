import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Eye, EyeOff, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api'
import { Spinner } from '@/components/ui'

function SenhaBar({ senha }: { senha: string }) {
  const checks = [senha.length >= 8, /[A-Z]/.test(senha), /\d/.test(senha), /[^A-Za-z0-9]/.test(senha)]
  const n = checks.filter(Boolean).length
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#00d4aa']
  const labels = ['8+ chars', 'Maiúscula', 'Número', 'Símbolo']
  if (!senha) return null
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < n ? colors[n] : 'var(--border)', transition: 'background .2s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
        {labels.map((label, i) => (
          <span key={label} style={{ color: checks[i] ? 'var(--accent)' : 'var(--text-dim)' }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

export function RedefinirSenhaPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [concluido, setConcluido] = useState(false)

  function validar() {
    if (senha.length < 8) { toast.error('Mínimo de 8 caracteres'); return false }
    if (!/[A-Z]/.test(senha)) { toast.error('Precisa de uma maiúscula'); return false }
    if (!/\d/.test(senha)) { toast.error('Precisa de um número'); return false }
    if (!/[^A-Za-z0-9]/.test(senha)) { toast.error('Precisa de um símbolo'); return false }
    if (senha !== confirmar) { toast.error('As senhas não coincidem'); return false }
    return true
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!validar()) return
    const token = params.get('token')
    if (!token) { toast.error('Token não encontrado.'); return }
    setLoading(true)
    try {
      await authApi.redefinirSenha({ token, nova_senha: senha })
      setConcluido(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Link inválido ou expirado.')
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(!showPass)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', fontFamily: 'var(--sans)', padding: '24px' }}>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '22px', boxShadow: 'var(--shadow)', padding: '36px 32px', maxWidth: '420px', width: '100%' }}>
        {concluido ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CheckCircle size={26} color="var(--accent)" />
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '10px', letterSpacing: '-0.02em' }}>Senha redefinida!</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '28px' }}>Sua senha foi atualizada com sucesso. Faça o login para continuar.</p>
            <button
              onClick={() => navigate('/login')}
              style={{ width: '100%', padding: '12px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}
            >
              Fazer login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.02em' }}>Redefinir senha</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.6 }}>Escolha uma senha forte para a sua conta.</p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--text-muted)', marginBottom: '6px' }}>Nova senha</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Mín. 8 caracteres"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 40px 12px 40px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box' }}
                />
                <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>{eyeBtn}</span>
              </div>
              <SenhaBar senha={senha} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--text-muted)', marginBottom: '6px' }}>Confirmar senha</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
                  <Lock size={15} />
                </span>
                <input
                  type={showPass ? 'text' : 'password'}
                  placeholder="Repita a senha"
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 12px 12px 40px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Spinner size={16} /> : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
