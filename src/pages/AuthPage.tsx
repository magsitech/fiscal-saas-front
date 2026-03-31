import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, CreditCard, Building2, ArrowRight, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import { authApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui'
import { USE_MOCK_API } from '@/config/runtime'

type Mode = 'login' | 'tipo' | 'form-pf' | 'form-pj'

const S = {
  root: { display:'flex', minHeight:'100vh', background:'var(--bg)', color:'var(--text)', fontFamily:'var(--sans)' },
  left: { width:'300px', flexShrink:0, background:'linear-gradient(160deg,#0e1a14,#070d0b)', borderRight:'1px solid rgba(0,212,170,.15)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'28px 22px', position:'relative', overflow:'hidden' },
  glow: { position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:'220px', height:'220px', background:'radial-gradient(circle,rgba(0,212,170,.1) 0%,transparent 70%)', pointerEvents:'none' },
  right: { flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'40px' },
  form: { width:'100%', maxWidth:'390px' },
  tabBar: { display:'flex', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'9px', padding:'3px', marginBottom:'26px' },
  tab: (on: boolean): React.CSSProperties => ({ flex:1, padding:'9px', borderRadius:'7px', fontSize:'13px', fontWeight:700, cursor:'pointer', border:'none', fontFamily:'var(--sans)', background:on?'var(--accent)':'transparent', color:on?'#000':'var(--text-muted)', transition:'all .15s' }),
  inp: (err?: boolean): React.CSSProperties => ({ width:'100%', background:'var(--surface-2)', border:`1px solid ${err?'var(--danger)':'var(--border)'}`, borderRadius:'8px', padding:'9px 11px 9px 34px', color:'var(--text)', fontSize:'13px', fontFamily:'var(--sans)', outline:'none' }),
  field: { marginBottom:'13px' },
  lbl: { display:'block', fontSize:'11px', fontWeight:700, textTransform:'uppercase' as const, letterSpacing:'.4px', color:'var(--text-muted)', marginBottom:'5px' },
  err: { fontSize:'11px', color:'var(--danger)', marginTop:'3px', display:'block' },
  icWrap: { position:'relative' as const },
  ic: { position:'absolute' as const, left:'10px', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', display:'flex', alignItems:'center' },
  submitBtn: (loading: boolean): React.CSSProperties => ({ width:'100%', marginTop:'8px', padding:'11px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', fontSize:'14px', fontWeight:700, cursor:loading?'not-allowed':'pointer', fontFamily:'var(--sans)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', opacity:loading?0.7:1 }),
  linkTxt: { textAlign:'center' as const, fontSize:'12px', color:'var(--text-muted)', marginTop:'16px' },
  linkSpan: { color:'var(--accent)', cursor:'pointer', fontWeight:700 },
} satisfies Record<string, React.CSSProperties | ((...args: any[]) => React.CSSProperties)>

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={S.field}>
      <label style={S.lbl}>{label}</label>
      {children}
      {error && <span style={S.err}>{error}</span>}
    </div>
  )
}

function IcInput({ icon, right, children }: { icon: React.ReactNode; right?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={S.icWrap}>
      <span style={S.ic}>{icon}</span>
      {children}
      {right && <span style={{ position:'absolute', right:'10px', top:'50%', transform:'translateY(-50%)' }}>{right}</span>}
    </div>
  )
}

function SenhaBar({ senha }: { senha: string }) {
  const checks = [senha.length >= 8, /[A-Z]/.test(senha), /\d/.test(senha), /[^A-Za-z0-9]/.test(senha)]
  const n = checks.filter(Boolean).length
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#00d4aa']
  const labels = ['8+ chars', 'Maiúscula', 'Número', 'Símbolo']
  if (!senha) return null
  return (
    <div style={{ marginTop:'6px' }}>
      <div style={{ display:'flex', gap:'3px', marginBottom:'4px' }}>
        {[0,1,2,3].map(i => <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i < n ? colors[n] : 'var(--border)', transition:'background .2s' }} />)}
      </div>
      <div style={{ display:'flex', gap:'10px', fontSize:'11px' }}>
        {labels.map((l, i) => <span key={l} style={{ color: checks[i] ? 'var(--accent)' : 'var(--text-dim)' }}>{l}</span>)}
      </div>
    </div>
  )
}

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const { setTokens, setUsuario } = useAuthStore()
  const navigate = useNavigate()

  const [loginForm, setLoginForm] = useState({ email: '', senha: '' })
  const [loginErros, setLoginErros] = useState<Record<string, string>>({})

  const [pfForm, setPfForm] = useState({ nome: '', email: '', cpf: '', senha: '', confirmar: '' })
  const [pfErros, setPfErros] = useState<Record<string, string>>({})

  const [pjForm, setPjForm] = useState({ razao_social: '', cnpj: '', responsavel: '', email: '', senha: '', confirmar: '' })
  const [pjErros, setPjErros] = useState<Record<string, string>>({})

  function switchToLogin() { setMode('login'); setLoginErros({}) }
  function switchToCadastro() { setMode('tipo') }

  function validarLogin() {
    const e: Record<string, string> = {}
    if (!loginForm.email) e.email = 'Obrigatório'
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) e.email = 'E-mail inválido'
    if (!loginForm.senha) e.senha = 'Obrigatório'
    setLoginErros(e); return !Object.keys(e).length
  }

  function validarPF() {
    const e: Record<string, string> = {}
    if (!pfForm.nome || pfForm.nome.length < 3) e.nome = 'Mínimo 3 caracteres'
    if (!pfForm.email || !/\S+@\S+\.\S+/.test(pfForm.email)) e.email = 'E-mail inválido'
    if (!/^\d{11}$/.test(pfForm.cpf.replace(/\D/g, ''))) e.cpf = 'CPF: 11 dígitos'
    if (pfForm.senha.length < 8) e.senha = 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(pfForm.senha)) e.senha = 'Precisa de uma maiúscula'
    if (!/\d/.test(pfForm.senha)) e.senha = 'Precisa de um número'
    if (pfForm.senha !== pfForm.confirmar) e.confirmar = 'Senhas não coincidem'
    setPfErros(e); return !Object.keys(e).length
  }

  function validarPJ() {
    const e: Record<string, string> = {}
    if (!pjForm.razao_social.trim()) e.razao_social = 'Obrigatório'
    if (!/^\d{14}$/.test(pjForm.cnpj.replace(/\D/g, ''))) e.cnpj = 'CNPJ: 14 dígitos'
    if (!pjForm.responsavel.trim()) e.responsavel = 'Obrigatório'
    if (!pjForm.email || !/\S+@\S+\.\S+/.test(pjForm.email)) e.email = 'E-mail inválido'
    if (pjForm.senha.length < 8) e.senha = 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(pjForm.senha)) e.senha = 'Precisa de uma maiúscula'
    if (!/\d/.test(pjForm.senha)) e.senha = 'Precisa de um número'
    if (pjForm.senha !== pjForm.confirmar) e.confirmar = 'Senhas não coincidem'
    setPjErros(e); return !Object.keys(e).length
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault(); if (!validarLogin()) return
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
    } finally { setLoading(false) }
  }

  async function handleCadastroPF(e: React.FormEvent) {
    e.preventDefault(); if (!validarPF()) return
    setLoading(true)
    try {
      await authApi.register({ nome: pfForm.nome, email: pfForm.email, cpf: pfForm.cpf.replace(/\D/g, ''), senha: pfForm.senha })
      toast.success('Conta criada! Faça o login.')
      setMode('login'); setLoginForm({ email: pfForm.email, senha: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao criar conta')
    } finally { setLoading(false) }
  }

  async function handleCadastroPJ(e: React.FormEvent) {
    e.preventDefault(); if (!validarPJ()) return
    setLoading(true)
    try {
      await authApi.register({ nome: pjForm.responsavel, email: pjForm.email, cpf: '', senha: pjForm.senha })
      toast.success('Conta criada! Faça o login.')
      setMode('login'); setLoginForm({ email: pjForm.email, senha: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao criar conta')
    } finally { setLoading(false) }
  }

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(!showPass)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-dim)', display:'flex' }}>
      {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  )

  return (
    <div style={S.root}>
      {/* ── Painel esquerdo ────────────────────────────── */}
      <div style={S.left}>
        <div style={S.glow} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'30px', cursor:'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width:'32px', height:'32px', background:'var(--accent)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:'11px', fontWeight:700, color:'#000', letterSpacing:'-.3px' }}>VN</div>
            <div><div style={{ fontWeight:700, fontSize:'14px' }}>validaeNota</div><div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'2px' }}>Área do Cliente</div></div>
          </div>
          {[['Validação oficial SEFAZ','NF-e 55 e NFC-e 65 via Web Services'], ['Anti-bloqueio garantido','Fila + rate limit + SSL reutilizado'], ['Cache inteligente 7 dias','Sem débito duplicado na mesma NF'], ['Cobrança progressiva','Quanto mais usar, menor o custo']].map(([t, d]) => (
            <div key={t} style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
              <div style={{ width:'26px', height:'26px', flexShrink:0, borderRadius:'6px', background:'var(--accent-dim)', border:'1px solid var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', marginTop:'1px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)' }} />
              </div>
              <div><div style={{ fontSize:'12px', fontWeight:700 }}>{t}</div><div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'2px', lineHeight:1.4 }}>{d}</div></div>
            </div>
          ))}
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:'9px' }}>Preços por faixa</div>
          {[['1 – 500','R$ 0,22'],['501 – 2.000','R$ 0,18'],['2.001 – 5.000','R$ 0,16'],['10.001+','R$ 0,13']].map(([f,p]) => (
            <div key={f} style={{ display:'flex', justifyContent:'space-between', marginBottom:'5px' }}>
              <span style={{ fontFamily:'var(--mono)', fontSize:'12px', color:'var(--text-muted)' }}>{f}</span>
              <span style={{ fontFamily:'var(--mono)', fontSize:'12px', fontWeight:700, color:'var(--accent)' }}>{p}</span>
            </div>
          ))}
          <div style={{ fontSize:'10px', color:'var(--text-dim)', marginTop:'5px' }}>* inclui adicional fixo de R$ 0,03</div>
        </div>
      </div>

      {/* ── Painel direito ─────────────────────────────── */}
      <div style={S.right}>
        <div style={S.form}>

          {/* Tab switcher — visível sempre */}
          <div style={S.tabBar}>
            <button style={S.tab(mode === 'login')} onClick={switchToLogin}>Entrar</button>
            <button style={S.tab(mode !== 'login')} onClick={switchToCadastro}>Criar conta</button>
          </div>

          {/* ── LOGIN ──────────────────────────────────── */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} noValidate>
              <h2 style={{ fontSize:'22px', fontWeight:700, marginBottom:'4px' }}>Bem-vindo de volta</h2>
              <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'22px' }}>Entre com e-mail e senha para acessar</p>
              <Field label="E-mail" error={loginErros.email}>
                <IcInput icon={<Mail size={14} />}>
                  <input type="email" placeholder="gestor@empresa.com" value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} style={S.inp(!!loginErros.email)} />
                </IcInput>
              </Field>
              <Field label="Senha" error={loginErros.senha}>
                <IcInput icon={<Lock size={14} />} right={eyeBtn}>
                  <input type={showPass ? 'text' : 'password'} placeholder="••••••••" value={loginForm.senha} onChange={e => setLoginForm({ ...loginForm, senha: e.target.value })} style={S.inp(!!loginErros.senha)} />
                </IcInput>
              </Field>
              {USE_MOCK_API && (
                <div style={{ marginBottom:'12px', padding:'10px 12px', borderRadius:'8px', background:'var(--accent-dim)', border:'1px solid var(--accent-glow)', fontSize:'12px', lineHeight:1.5, color:'var(--text-muted)' }}>
                  Demo: <strong style={{ color:'var(--text)' }}>demo@validaenota.com.br</strong> / <strong style={{ color:'var(--text)' }}>Demo@123</strong>
                </div>
              )}
              <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
                {loading ? <Spinner size={16} /> : <>Entrar <ArrowRight size={16} /></>}
              </button>
              <p style={S.linkTxt}>Não tem conta? <span style={S.linkSpan} onClick={switchToCadastro}>Criar conta</span></p>
            </form>
          )}

          {/* ── PASSO 1: Seleção do tipo ────────────────── */}
          {mode === 'tipo' && (
            <div>
              <h2 style={{ fontSize:'22px', fontWeight:700, marginBottom:'6px' }}>Criar conta</h2>
              <p style={{ fontSize:'13px', color:'var(--text-muted)', marginBottom:'28px', lineHeight:1.6 }}>
                Selecione como deseja se cadastrar para continuar
              </p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }}>
                {/* Card PF */}
                <button
                  onClick={() => setMode('form-pf')}
                  style={{ border:'1.5px solid var(--border)', borderRadius:'12px', padding:'24px 16px', cursor:'pointer', background:'transparent', fontFamily:'var(--sans)', color:'var(--text)', transition:'all .18s', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'var(--surface-2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px', color:'var(--text-muted)' }}>
                    <User size={20} />
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:700, marginBottom:'6px' }}>Pessoa Física</div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', lineHeight:1.5 }}>Cadastro com CPF para pessoas físicas</div>
                </button>
                {/* Card PJ */}
                <button
                  onClick={() => setMode('form-pj')}
                  style={{ border:'1.5px solid var(--border)', borderRadius:'12px', padding:'24px 16px', cursor:'pointer', background:'transparent', fontFamily:'var(--sans)', color:'var(--text)', transition:'all .18s', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent-dim)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <div style={{ width:'44px', height:'44px', borderRadius:'10px', background:'var(--surface-2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px', color:'var(--text-muted)' }}>
                    <Building2 size={20} />
                  </div>
                  <div style={{ fontSize:'14px', fontWeight:700, marginBottom:'6px' }}>Pessoa Jurídica</div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', lineHeight:1.5 }}>Cadastro com CNPJ para empresas</div>
                </button>
              </div>
              <p style={S.linkTxt}>Já tem conta? <span style={S.linkSpan} onClick={switchToLogin}>Entrar</span></p>
            </div>
          )}

          {/* ── PASSO 2a: Formulário PF ─────────────────── */}
          {mode === 'form-pf' && (
            <form onSubmit={handleCadastroPF} noValidate>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <button type="button" onClick={() => setMode('tipo')} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'7px', padding:'6px 10px', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontFamily:'var(--sans)' }}>
                  <ArrowLeft size={13} /> Voltar
                </button>
                <div>
                  <div style={{ fontSize:'18px', fontWeight:700, lineHeight:1 }}>Pessoa Física</div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'3px' }}>Preencha seus dados pessoais</div>
                </div>
              </div>
              <Field label="Nome completo" error={pfErros.nome}>
                <IcInput icon={<User size={14} />}>
                  <input placeholder="Maria da Silva" value={pfForm.nome} onChange={e => setPfForm({ ...pfForm, nome: e.target.value })} style={S.inp(!!pfErros.nome)} />
                </IcInput>
              </Field>
              <Field label="E-mail" error={pfErros.email}>
                <IcInput icon={<Mail size={14} />}>
                  <input type="email" placeholder="maria@email.com" value={pfForm.email} onChange={e => setPfForm({ ...pfForm, email: e.target.value })} style={S.inp(!!pfErros.email)} />
                </IcInput>
              </Field>
              <Field label="CPF" error={pfErros.cpf}>
                <IcInput icon={<CreditCard size={14} />}>
                  <input placeholder="000.000.000-00" maxLength={14} inputMode="numeric" value={pfForm.cpf} onChange={e => setPfForm({ ...pfForm, cpf: e.target.value.replace(/\D/g,'').slice(0,11) })} style={S.inp(!!pfErros.cpf)} />
                </IcInput>
              </Field>
              <Field label="Senha" error={pfErros.senha}>
                <IcInput icon={<Lock size={14} />} right={eyeBtn}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Mín. 8 caracteres" value={pfForm.senha} onChange={e => setPfForm({ ...pfForm, senha: e.target.value })} style={S.inp(!!pfErros.senha)} />
                </IcInput>
                <SenhaBar senha={pfForm.senha} />
              </Field>
              <Field label="Confirmar senha" error={pfErros.confirmar}>
                <IcInput icon={<Lock size={14} />}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={pfForm.confirmar} onChange={e => setPfForm({ ...pfForm, confirmar: e.target.value })} style={S.inp(!!pfErros.confirmar)} />
                </IcInput>
              </Field>
              <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
                {loading ? <Spinner size={16} /> : <>Criar conta <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

          {/* ── PASSO 2b: Formulário PJ ─────────────────── */}
          {mode === 'form-pj' && (
            <form onSubmit={handleCadastroPJ} noValidate>
              <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px' }}>
                <button type="button" onClick={() => setMode('tipo')} style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'7px', padding:'6px 10px', cursor:'pointer', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'5px', fontSize:'12px', fontFamily:'var(--sans)' }}>
                  <ArrowLeft size={13} /> Voltar
                </button>
                <div>
                  <div style={{ fontSize:'18px', fontWeight:700, lineHeight:1 }}>Pessoa Jurídica</div>
                  <div style={{ fontSize:'12px', color:'var(--text-muted)', marginTop:'3px' }}>Preencha os dados da empresa</div>
                </div>
              </div>
              <Field label="Razão Social" error={pjErros.razao_social}>
                <IcInput icon={<Building2 size={14} />}>
                  <input placeholder="Empresa Exemplo LTDA" value={pjForm.razao_social} onChange={e => setPjForm({ ...pjForm, razao_social: e.target.value })} style={S.inp(!!pjErros.razao_social)} />
                </IcInput>
              </Field>
              <Field label="CNPJ" error={pjErros.cnpj}>
                <IcInput icon={<CreditCard size={14} />}>
                  <input placeholder="00.000.000/0001-00" maxLength={18} inputMode="numeric" value={pjForm.cnpj} onChange={e => setPjForm({ ...pjForm, cnpj: e.target.value.replace(/\D/g,'').slice(0,14) })} style={S.inp(!!pjErros.cnpj)} />
                </IcInput>
              </Field>
              <Field label="Nome do responsável" error={pjErros.responsavel}>
                <IcInput icon={<User size={14} />}>
                  <input placeholder="João da Silva" value={pjForm.responsavel} onChange={e => setPjForm({ ...pjForm, responsavel: e.target.value })} style={S.inp(!!pjErros.responsavel)} />
                </IcInput>
              </Field>
              <Field label="E-mail corporativo" error={pjErros.email}>
                <IcInput icon={<Mail size={14} />}>
                  <input type="email" placeholder="contato@empresa.com" value={pjForm.email} onChange={e => setPjForm({ ...pjForm, email: e.target.value })} style={S.inp(!!pjErros.email)} />
                </IcInput>
              </Field>
              <Field label="Senha" error={pjErros.senha}>
                <IcInput icon={<Lock size={14} />} right={eyeBtn}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Mín. 8 caracteres" value={pjForm.senha} onChange={e => setPjForm({ ...pjForm, senha: e.target.value })} style={S.inp(!!pjErros.senha)} />
                </IcInput>
                <SenhaBar senha={pjForm.senha} />
              </Field>
              <Field label="Confirmar senha" error={pjErros.confirmar}>
                <IcInput icon={<Lock size={14} />}>
                  <input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={pjForm.confirmar} onChange={e => setPjForm({ ...pjForm, confirmar: e.target.value })} style={S.inp(!!pjErros.confirmar)} />
                </IcInput>
              </Field>
              <button type="submit" disabled={loading} style={S.submitBtn(loading)}>
                {loading ? <Spinner size={16} /> : <>Criar conta <ArrowRight size={16} /></>}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  )
}
