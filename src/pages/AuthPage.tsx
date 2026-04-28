import { useEffect, useState, type CSSProperties, type ReactNode, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Menu,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui'

type Mode = 'login' | 'esqueci-senha'

const S = {
  root: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg)',
    color: 'var(--text)',
    fontFamily: 'var(--sans)',
  },
  left: {
    width: '320px',
    flexShrink: 0,
    background: 'linear-gradient(160deg, var(--surface), color-mix(in srgb, var(--surface) 62%, var(--accent-dim) 38%))',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px 22px',
    position: 'relative',
    overflow: 'hidden',
  } satisfies CSSProperties,
  glow: {
    position: 'absolute',
    top: '22%',
    left: '55%',
    transform: 'translate(-50%,-50%)',
    width: '220px',
    height: '220px',
    background: 'radial-gradient(circle, var(--accent-glow) 0%, transparent 72%)',
    pointerEvents: 'none',
  },
  right: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 40px',
  },
  formShell: {
    width: '100%',
    maxWidth: '470px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '20px',
  },
  topBarActions: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '10px',
    flexWrap: 'wrap',
  },
  topBarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  ghostBtn: {
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    borderRadius: '999px',
    padding: '10px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 700,
    width: '38px',
    height: '38px',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '22px',
    boxShadow: 'var(--shadow)',
    padding: '28px',
  },
  form: {
    width: '100%',
    maxWidth: '390px',
    margin: '0 auto',
  },
  inp: (err?: boolean): React.CSSProperties => ({
    width: '100%',
    background: 'var(--surface-2)',
    border: `1px solid ${err ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: '12px',
    padding: '12px 12px 12px 40px',
    color: 'var(--text)',
    fontSize: '14px',
    fontFamily: 'var(--sans)',
    outline: 'none',
  }),
  field: { marginBottom: '14px' },
  lbl: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: '.4px',
    color: 'var(--text-muted)',
    marginBottom: '6px',
  },
  err: { fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block' },
  icWrap: { position: 'relative' as const },
  ic: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-dim)',
    display: 'flex',
    alignItems: 'center',
  },
  submitBtn: (loading: boolean): React.CSSProperties => ({
    width: '100%',
    marginTop: '10px',
    padding: '12px',
    background: 'var(--accent)',
    color: '#04110d',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: loading ? 'not-allowed' : 'pointer',
    fontFamily: 'var(--sans)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: loading ? 0.7 : 1,
  }),
  linkTxt: { textAlign: 'center' as const, fontSize: '12px', color: 'var(--text-muted)', marginTop: '16px' },
  linkSpan: { color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 },
} satisfies Record<string, CSSProperties | ((...args: any[]) => CSSProperties)>

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div style={S.field}>
      <label style={S.lbl}>{label}</label>
      {children}
      {error && <span style={S.err}>{error}</span>}
    </div>
  )
}

function IcInput({ icon, right, children }: { icon: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div style={S.icWrap}>
      <span style={S.ic}>{icon}</span>
      {children}
      {right && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>{right}</span>}
    </div>
  )
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showAside, setShowAside] = useState(() => (typeof window === 'undefined' ? true : window.innerWidth >= 901))
  const { setTokens, setUsuario } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const plano = searchParams.get('plano')
    if (plano) navigate(`/planos?plano=${plano}`, { replace: true })
  }, [])

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' })
  const [loginErros, setLoginErros] = useState<Record<string, string>>({})

  function switchToLogin() {
    setMode('login')
    setLoginErros({})
  }

  function validarLogin() {
    const e: Record<string, string> = {}
    if (!loginForm.email) e.email = 'Obrigatório'
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) e.email = 'E-mail inválido'
    if (!loginForm.senha) e.senha = 'Obrigatório'
    setLoginErros(e)
    return !Object.keys(e).length
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    if (!validarLogin()) return
    setLoading(true)
    try {
      const tokens = await authApi.login({ username: loginForm.email, password: loginForm.senha })
      setTokens(tokens.access_token, tokens.refresh_token)
      const me = await authApi.me()
      setUsuario(me)
      toast.success(`Bem-vindo, ${me.nome.split(' ')[0]}!`)
      navigate('/app')
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  const [esqueciEmail, setEsqueciEmail] = useState('')
  const [esqueciEnviado, setEsqueciEnviado] = useState(false)

  async function handleEsqueciSenha(e: FormEvent) {
    e.preventDefault()
    if (!esqueciEmail || !/\S+@\S+\.\S+/.test(esqueciEmail)) {
      toast.error('Informe um e-mail válido')
      return
    }
    setLoading(true)
    try {
      await authApi.esqueciSenha({ email: esqueciEmail })
      setEsqueciEnviado(true)
    } catch {
      setEsqueciEnviado(true)
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
    <div style={S.root} className={`auth-root${showAside ? '' : ' auth-root-collapsed'}`}>
      {showAside && (
        <aside style={S.left} className="auth-left">
          <div style={S.glow} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
              <div className="app-desktop-only">
                <ThemeToggle />
              </div>
              <button type="button" onClick={() => setShowAside(false)} style={S.ghostBtn}>
                <Menu size={15} />
              </button>
            </div>

            {[
              ['Validação oficial SEFAZ', 'NF-e e NFC-e com consulta pelos serviços oficiais'],
              ['Operação estável', 'Fila, controle de ritmo e processamento seguro'],
              ['Cobrança progressiva', 'Quanto maior o volume, menor o custo unitário'],
            ].map(([title, description]) => (
              <div key={title} style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '26px', height: '26px', flexShrink: 0, borderRadius: '6px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700 }}>{title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: 1.5 }}>{description}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-dim)', marginBottom: '10px' }}>Preços por faixa</div>
            {[
              ['1 - 500', 'R$ 0,22'],
              ['501 - 2.000', 'R$ 0,18'],
              ['2.001 - 5.000', 'R$ 0,16'],
              ['10.001+', 'R$ 0,13'],
            ].map(([range, price]) => (
              <div key={range} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{range}</span>
                <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{price}</span>
              </div>
            ))}
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px' }}>* inclui adicional fixo de R$ 0,03</div>
            <div style={{ borderTop: '1px solid var(--border)', marginTop: '18px', paddingTop: '18px', textAlign: 'center', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
              © 2026 ValidaENota. Plataforma de validação fiscal brasileira.
            </div>
          </div>
        </aside>
      )}

      <main style={S.right} className="auth-right">
        <div style={S.formShell}>
          <div style={S.topBar} className="auth-topbar">
            <div style={S.topBarLeft}>
              <button type="button" onClick={() => navigate('/')} style={S.ghostBtn}>
                <ArrowLeft size={15} />
              </button>
              {!showAside && (
                <button type="button" onClick={() => setShowAside(true)} style={S.ghostBtn}>
                  <Menu size={15} />
                </button>
              )}
            </div>

            <div style={S.topBarActions} className="auth-topbar-actions">
              <div className="app-mobile-only">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.form} className="auth-form">
              {mode === 'login' && (
                <form onSubmit={handleLogin} noValidate>
                  <h2 style={{ fontSize: '30px', fontWeight: 700, marginBottom: '6px', letterSpacing: '-0.03em' }}>Bem-vindo de volta</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>Entre com e-mail e senha para acessar o seu painel.</p>
                  <Field label="E-mail" error={loginErros.email}>
                    <IcInput icon={<Mail size={15} />}>
                      <input type="email" placeholder="gestor@empresa.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} style={S.inp(!!loginErros.email)} />
                    </IcInput>
                  </Field>
                  <Field label="Senha" error={loginErros.senha}>
                    <IcInput icon={<Lock size={15} />} right={eyeBtn}>
                      <input type={showPass ? 'text' : 'password'} placeholder="Digite sua senha" value={loginForm.senha} onChange={(e) => setLoginForm({ ...loginForm, senha: e.target.value })} style={S.inp(!!loginErros.senha)} />
                    </IcInput>
                  </Field>
                  <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
                    {loading ? <Spinner size={16} /> : <>Entrar <ArrowRight size={16} /></>}
                  </button>
                  <p style={S.linkTxt}>
                    <span style={S.linkSpan} onClick={() => { setEsqueciEmail(''); setEsqueciEnviado(false); setMode('esqueci-senha') }}>Esqueci minha senha</span>
                  </p>
                  <p style={S.linkTxt}>
                    Não tem conta?{' '}
                    <span style={S.linkSpan} onClick={() => navigate('/planos')}>Criar conta</span>
                  </p>
                </form>
              )}

              {mode === 'esqueci-senha' && (
                <form onSubmit={handleEsqueciSenha} noValidate>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
                    <button type="button" onClick={switchToLogin} style={S.ghostBtn}>
                      <ArrowLeft size={14} />
                    </button>
                    <div>
                      <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>Esqueci minha senha</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Enviaremos um link de redefinição</div>
                    </div>
                  </div>
                  {esqueciEnviado ? (
                    <div style={{ textAlign: 'center', padding: '12px 0' }}>
                      <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                        <Mail size={22} color="var(--accent)" />
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                        Se esse e-mail estiver cadastrado, você receberá as instruções em breve.
                      </p>
                      <p style={S.linkTxt}>
                        <span style={S.linkSpan} onClick={switchToLogin}>Voltar para o login</span>
                      </p>
                    </div>
                  ) : (
                    <>
                      <Field label="E-mail">
                        <IcInput icon={<Mail size={15} />}>
                          <input type="email" placeholder="seu@email.com" value={esqueciEmail} onChange={(e) => setEsqueciEmail(e.target.value)} style={S.inp()} />
                        </IcInput>
                      </Field>
                      <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
                        {loading ? <Spinner size={16} /> : <>Enviar link <ArrowRight size={16} /></>}
                      </button>
                    </>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
