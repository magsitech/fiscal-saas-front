// AuthScreen — feat/planos-assinatura branch
// Tab bar: Entrar / Criar conta
// Fluxo de cadastro: tipo (PF/PJ) → form

function SenhaBarAuth({ senha }) {
  const checks = [senha.length >= 8, /[A-Z]/.test(senha), /\d/.test(senha), /[^A-Za-z0-9]/.test(senha)]
  const n = checks.filter(Boolean).length
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#00d4aa']
  const labels = ['8+ chars', 'Maiúscula', 'Número', 'Símbolo']
  if (!senha) return null
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
        {[0,1,2,3].map(i => <div key={i} style={{ flex:1, height:'3px', borderRadius:'2px', background: i < n ? colors[n] : 'var(--border)', transition:'background .2s' }} />)}
      </div>
      <div style={{ display:'flex', gap:'10px', fontSize:'11px', flexWrap:'wrap' }}>
        {labels.map((l,i) => <span key={l} style={{ color: checks[i] ? 'var(--accent)' : 'var(--text-dim)' }}>{l}</span>)}
      </div>
    </div>
  )
}

function AuthScreen({ navigate }) {
  const [tab, setTab] = React.useState('login') // login | cadastro
  const [mode, setMode] = React.useState('login') // login | tipo | form-pf | form-pj | esqueci
  const [showPass, setShowPass] = React.useState(false)

  const [loginForm, setLoginForm] = React.useState({ email: '', senha: '' })
  const [pfForm, setPfForm] = React.useState({ nome: '', email: '', cpf: '', senha: '', confirmar: '' })
  const [pjForm, setPjForm] = React.useState({ razao_social: '', cnpj: '', responsavel: '', email: '', senha: '', confirmar: '' })
  const [esqueciEmail, setEsqueciEmail] = React.useState('')
  const [esqueciEnviado, setEsqueciEnviado] = React.useState(false)

  const inpStyle = (err) => ({
    width:'100%', background:'var(--surface-2)',
    border:`1px solid ${err ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius:'12px', padding:'12px 12px 12px 40px',
    color:'var(--text)', fontSize:'14px', fontFamily:'var(--font-sans)',
    outline:'none', boxSizing:'border-box',
  })

  function switchTab(t) {
    setTab(t)
    setMode(t === 'login' ? 'login' : 'tipo')
  }

  const tabBarStyle = { display:'flex', background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'12px', padding:'4px', marginBottom:'26px' }
  const tabStyle = (on) => ({ flex:1, padding:'10px', borderRadius:'9px', fontSize:'13px', fontWeight:700, cursor:'pointer', border:'none', fontFamily:'var(--font-sans)', background: on ? 'var(--accent)' : 'transparent', color: on ? '#04110d' : 'var(--text-muted)', transition:'all .15s' })

  const ghostBtn = { border:'1px solid var(--border)', background:'var(--surface)', color:'var(--text-muted)', borderRadius:'999px', width:'38px', height:'38px', display:'inline-flex', alignItems:'center', justifyContent:'center', cursor:'pointer', fontSize:'14px' }

  const IcWrap = ({icon, children, right}) => (
    <div style={{ position:'relative' }}>
      <span style={{ position:'absolute', left:'12px', top:'50%', transform:'translateY(-50%)', color:'var(--text-dim)', fontSize:'14px' }}>{icon}</span>
      {children}
      {right && <span style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)' }}>{right}</span>}
    </div>
  )

  const Field = ({label, error, children}) => (
    <div style={{ marginBottom:'14px' }}>
      <label style={{ display:'block', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'.4px', color:'var(--text-muted)', marginBottom:'6px' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize:'11px', color:'var(--danger)', marginTop:'4px', display:'block' }}>{error}</span>}
    </div>
  )

  const SubmitBtn = ({children, onClick}) => (
    <button onClick={onClick} style={{ width:'100%', marginTop:'10px', padding:'12px', background:'var(--accent)', color:'#04110d', border:'none', borderRadius:'12px', fontSize:'14px', fontWeight:700, cursor:'pointer', fontFamily:'var(--font-sans)', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' }}>
      {children}
    </button>
  )

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(v => !v)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-dim)', fontSize:'13px' }}>
      {showPass ? '🙈' : '👁'}
    </button>
  )

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'var(--bg)', color:'var(--text)', fontFamily:'var(--font-sans)' }} className="auth-root">
      {/* Left panel */}
      <aside style={{ width:'320px', flexShrink:0, background:'linear-gradient(160deg, var(--surface), color-mix(in srgb, var(--surface) 62%, var(--accent-dim) 38%))', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', justifyContent:'space-between', padding:'24px 22px', position:'relative', overflow:'hidden' }} className="auth-left">
        <div style={{ position:'absolute', top:'22%', left:'55%', transform:'translate(-50%,-50%)', width:'220px', height:'220px', background:'radial-gradient(circle, var(--accent-glow) 0%, transparent 72%)', pointerEvents:'none' }} />
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ marginBottom:'28px' }}>
            <img src="../../assets/validaenota.png" alt="validaENota" style={{ width:'34px', height:'34px', objectFit:'contain' }} />
          </div>
          {[['Validação oficial SEFAZ','NF-e e NFC-e com consulta pelos serviços oficiais'],['Operação estável','Fila, controle de ritmo e processamento seguro'],['Cobrança progressiva','Quanto maior o volume, menor o custo unitário']].map(([t,d]) => (
            <div key={t} style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
              <div style={{ width:'26px', height:'26px', flexShrink:0, borderRadius:'6px', background:'var(--accent-dim)', border:'1px solid var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', marginTop:'1px' }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'var(--accent)' }} />
              </div>
              <div>
                <div style={{ fontSize:'12px', fontWeight:700 }}>{t}</div>
                <div style={{ fontSize:'11px', color:'var(--text-muted)', marginTop:'2px', lineHeight:1.5 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ position:'relative', zIndex:1 }}>
          <div style={{ fontSize:'10px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', color:'var(--text-dim)', marginBottom:'10px' }}>Preços por faixa</div>
          {[['1 – 500','R$ 0,22'],['501 – 2.000','R$ 0,18'],['2.001 – 5.000','R$ 0,16'],['10.001+','R$ 0,13']].map(([r,p]) => (
            <div key={r} style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', color:'var(--text-muted)' }}>{r}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:'12px', fontWeight:700, color:'var(--accent)' }}>{p}</span>
            </div>
          ))}
          <div style={{ fontSize:'10px', color:'var(--text-dim)', marginTop:'6px' }}>* inclui adicional fixo de R$ 0,03</div>
          <div style={{ borderTop:'1px solid var(--border)', marginTop:'18px', paddingTop:'18px', textAlign:'center', fontSize:'11px', color:'var(--text-dim)' }}>© 2026 validaeNota</div>
        </div>
      </aside>

      {/* Right */}
      <main style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', padding:'32px 40px' }} className="auth-right">
        <div style={{ width:'100%', maxWidth:'470px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
            <button onClick={() => navigate('landing')} style={ghostBtn}>←</button>
          </div>

          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'22px', boxShadow:'var(--shadow)', padding:'28px' }}>
            <div style={{ maxWidth:'390px', margin:'0 auto' }}>

              {/* Tab bar — só quando não está em modo esqueci */}
              {mode !== 'esqueci' && (
                <div style={tabBarStyle}>
                  <button style={tabStyle(tab === 'login')} onClick={() => switchTab('login')}>Entrar</button>
                  <button style={tabStyle(tab === 'cadastro')} onClick={() => switchTab('cadastro')}>Criar conta</button>
                </div>
              )}

              {/* LOGIN */}
              {mode === 'login' && (
                <div>
                  <h2 style={{ fontSize:'30px', fontWeight:700, marginBottom:'6px', letterSpacing:'-0.03em' }}>Bem-vindo de volta</h2>
                  <p style={{ fontSize:'14px', color:'var(--text-muted)', marginBottom:'24px' }}>Entre com e-mail e senha para acessar o seu painel.</p>
                  <Field label="E-mail">
                    <IcWrap icon="✉">
                      <input type="email" placeholder="gestor@empresa.com" value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} style={inpStyle(false)} />
                    </IcWrap>
                  </Field>
                  <Field label="Senha">
                    <IcWrap icon="🔒" right={eyeBtn}>
                      <input type={showPass ? 'text' : 'password'} placeholder="Digite sua senha" value={loginForm.senha} onChange={e => setLoginForm({...loginForm, senha: e.target.value})} style={{ ...inpStyle(false), paddingRight:'40px' }} />
                    </IcWrap>
                  </Field>
                  <SubmitBtn onClick={() => navigate('dashboard')}>Entrar →</SubmitBtn>
                  <p style={{ textAlign:'center', fontSize:'12px', color:'var(--text-muted)', marginTop:'16px' }}>
                    <span style={{ color:'var(--accent)', cursor:'pointer', fontWeight:700 }} onClick={() => { setMode('esqueci'); setEsqueciEnviado(false) }}>Esqueci minha senha</span>
                  </p>
                </div>
              )}

              {/* SELEÇÃO PF/PJ */}
              {mode === 'tipo' && (
                <div>
                  <h2 style={{ fontSize:'30px', fontWeight:700, marginBottom:'6px', letterSpacing:'-0.03em' }}>Criar conta</h2>
                  <p style={{ fontSize:'14px', color:'var(--text-muted)', marginBottom:'28px', lineHeight:1.6 }}>Selecione como deseja se cadastrar para continuar.</p>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px', marginBottom:'20px' }} className="auth-type-grid">
                    {[{tipo:'pf', icon:'👤', title:'Pessoa Física', sub:'Cadastro com CPF para pessoas físicas'},
                      {tipo:'pj', icon:'🏢', title:'Pessoa Jurídica', sub:'Cadastro com CNPJ para empresas'}
                    ].map(item => (
                      <button key={item.tipo} onClick={() => setMode(`form-${item.tipo}`)}
                        style={{ border:'1.5px solid var(--border)', borderRadius:'16px', padding:'24px 16px', cursor:'pointer', background:'transparent', fontFamily:'var(--font-sans)', color:'var(--text)', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', transition:'all .18s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='var(--accent)'; e.currentTarget.style.background='var(--accent-dim)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='var(--border)'; e.currentTarget.style.background='transparent' }}
                      >
                        <div style={{ width:'46px', height:'46px', borderRadius:'12px', background:'var(--surface-2)', border:'1px solid var(--border)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'14px', fontSize:'20px' }}>{item.icon}</div>
                        <div style={{ fontSize:'15px', fontWeight:700, marginBottom:'6px' }}>{item.title}</div>
                        <div style={{ fontSize:'12px', color:'var(--text-muted)', lineHeight:1.5 }}>{item.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FORM PF */}
              {mode === 'form-pf' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
                    <button onClick={() => setMode('tipo')} style={ghostBtn}>←</button>
                    <div>
                      <div style={{ fontSize:'20px', fontWeight:700 }}>Pessoa Física</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Preencha seus dados pessoais</div>
                    </div>
                  </div>
                  <Field label="Nome completo">
                    <IcWrap icon="👤"><input placeholder="Maria da Silva" value={pfForm.nome} onChange={e => setPfForm({...pfForm, nome: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="E-mail">
                    <IcWrap icon="✉"><input type="email" placeholder="maria@email.com" value={pfForm.email} onChange={e => setPfForm({...pfForm, email: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="CPF">
                    <IcWrap icon="💳"><input placeholder="000.000.000-00" maxLength={14} value={pfForm.cpf} onChange={e => setPfForm({...pfForm, cpf: e.target.value.replace(/\D/g,'').slice(0,11)})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="Senha">
                    <IcWrap icon="🔒" right={eyeBtn}><input type={showPass ? 'text' : 'password'} placeholder="Mín. 8 caracteres" value={pfForm.senha} onChange={e => setPfForm({...pfForm, senha: e.target.value})} style={{ ...inpStyle(false), paddingRight:'40px' }} /></IcWrap>
                    <SenhaBarAuth senha={pfForm.senha} />
                  </Field>
                  <Field label="Confirmar senha">
                    <IcWrap icon="🔒"><input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={pfForm.confirmar} onChange={e => setPfForm({...pfForm, confirmar: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <SubmitBtn onClick={() => navigate('dashboard')}>Criar conta →</SubmitBtn>
                </div>
              )}

              {/* FORM PJ */}
              {mode === 'form-pj' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
                    <button onClick={() => setMode('tipo')} style={ghostBtn}>←</button>
                    <div>
                      <div style={{ fontSize:'20px', fontWeight:700 }}>Pessoa Jurídica</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Preencha os dados da empresa</div>
                    </div>
                  </div>
                  <Field label="Razão social">
                    <IcWrap icon="🏢"><input placeholder="Empresa Exemplo LTDA" value={pjForm.razao_social} onChange={e => setPjForm({...pjForm, razao_social: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="CNPJ">
                    <IcWrap icon="💳"><input placeholder="00.000.000/0001-00" maxLength={18} value={pjForm.cnpj} onChange={e => setPjForm({...pjForm, cnpj: e.target.value.replace(/\D/g,'').slice(0,14)})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="Nome do responsável">
                    <IcWrap icon="👤"><input placeholder="João da Silva" value={pjForm.responsavel} onChange={e => setPjForm({...pjForm, responsavel: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="E-mail corporativo">
                    <IcWrap icon="✉"><input type="email" placeholder="contato@empresa.com" value={pjForm.email} onChange={e => setPjForm({...pjForm, email: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <Field label="Senha">
                    <IcWrap icon="🔒" right={eyeBtn}><input type={showPass ? 'text' : 'password'} placeholder="Mín. 8 caracteres" value={pjForm.senha} onChange={e => setPjForm({...pjForm, senha: e.target.value})} style={{ ...inpStyle(false), paddingRight:'40px' }} /></IcWrap>
                    <SenhaBarAuth senha={pjForm.senha} />
                  </Field>
                  <Field label="Confirmar senha">
                    <IcWrap icon="🔒"><input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={pjForm.confirmar} onChange={e => setPjForm({...pjForm, confirmar: e.target.value})} style={inpStyle(false)} /></IcWrap>
                  </Field>
                  <SubmitBtn onClick={() => navigate('dashboard')}>Criar conta →</SubmitBtn>
                </div>
              )}

              {/* ESQUECI SENHA */}
              {mode === 'esqueci' && (
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'18px' }}>
                    <button onClick={() => { setMode('login'); setTab('login') }} style={ghostBtn}>←</button>
                    <div>
                      <div style={{ fontSize:'20px', fontWeight:700 }}>Esqueci minha senha</div>
                      <div style={{ fontSize:'12px', color:'var(--text-muted)' }}>Enviaremos um link de redefinição</div>
                    </div>
                  </div>
                  {esqueciEnviado ? (
                    <div style={{ textAlign:'center', padding:'12px 0' }}>
                      <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'var(--accent-dim)', border:'1px solid var(--accent-glow)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'22px' }}>✉</div>
                      <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.6, marginBottom:'24px' }}>Se esse e-mail estiver cadastrado, você receberá as instruções em breve.</p>
                      <span style={{ color:'var(--accent)', cursor:'pointer', fontWeight:700, fontSize:'12px' }} onClick={() => { setMode('login'); setTab('login') }}>Voltar para o login</span>
                    </div>
                  ) : (
                    <>
                      <Field label="E-mail">
                        <IcWrap icon="✉"><input type="email" placeholder="seu@email.com" value={esqueciEmail} onChange={e => setEsqueciEmail(e.target.value)} style={inpStyle(false)} /></IcWrap>
                      </Field>
                      <SubmitBtn onClick={() => setEsqueciEnviado(true)}>Enviar link →</SubmitBtn>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

Object.assign(window, { AuthScreen })
