// LandingScreen — validaENota landing page (staging branch)

const STEPS = [
  { num: '01', title: 'Leitura dos dados da nota', desc: 'Seu sistema captura a chave da NF-e ou NFC-e e os dados necessários para validação.' },
  { num: '02', title: 'Envio para a API', desc: 'A aplicação envia os dados da consulta para a nossa API, respeitando o ambiente configurado.' },
  { num: '03', title: 'Consulta oficial na SEFAZ', desc: 'Processamos a validação pelos serviços oficiais, sem atalhos e sem fontes paralelas.' },
  { num: '04', title: 'Retorno com auditoria', desc: 'Você recebe o resultado da validação e mantém o histórico disponível para auditoria e conferência.' },
]

const PLANOS = [
  { id: 'TRIAL', nome: 'Trial', preco: null, tag: '14 dias grátis', tagColor: '#3b82f6', destaque: false, isTrial: true,
    features: ['14 dias de acesso completo', 'R$ 50,00 em créditos incluídos', 'Validação NF-e e NFC-e', 'Dashboard e relatórios', 'Sem cartão de crédito'],
    btnLabel: 'Começar grátis' },
  { id: 'BASICO', nome: 'Básico', preco: 29, tag: null, destaque: false, isTrial: false,
    features: ['Validação NF-e e NFC-e', 'Cobrança pré-paga por uso', 'R$ 0,22 fixo por consulta', 'Sem desconto por volume', 'Suporte por e-mail'],
    btnLabel: 'Assinar plano Básico' },
  { id: 'PRO', nome: 'Pro', preco: 99, tag: 'Mais popular', tagColor: '#00d4aa', destaque: true, isTrial: false,
    features: ['500 consultas/mês incluídas', 'Excedente com cobrança progressiva', 'Validação NF-e e NFC-e', 'Dashboard e relatórios', 'Suporte prioritário'],
    btnLabel: 'Assinar plano Pro' },
  { id: 'BUSINESS', nome: 'Business', preco: 149, tag: null, destaque: false, isTrial: false,
    features: ['1.000 consultas/mês incluídas', 'Excedente começa na faixa 2 (−18%)', 'Validação NF-e e NFC-e', 'Webhook por consulta', 'Suporte prioritário + SLA'],
    btnLabel: 'Assinar plano Business' },
]

const VANTAGENS = [
  { title: 'Consulta automatizada via RPA', desc: 'Consultas realizadas por RPA, com automação do fluxo, rastreabilidade operacional e estabilidade para uso em escala.' },
  { title: 'Arquitetura anti-bloqueio', desc: 'Fila de processamento, rate limit controlado e operação preparada para estabilidade em produção.' },
  { title: 'Cobrança progressiva', desc: 'Quanto maior o volume no período, menor o custo unitário por consulta.' },
  { title: 'Painel completo', desc: 'Dashboard com auditoria fiscal, extrato financeiro, simulador de custos e compra de créditos.' },
  { title: 'Gestão segura por cliente', desc: 'Cada cliente opera com saldo, auditoria e histórico próprios, com separação clara entre ambientes.' },
]

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
      {children}
    </div>
  )
}

function NavBar({ navigate }) {
  const [active, setActive] = React.useState('home')
  const sections = [
    { id: 'home', label: 'Home' }, { id: 'sobre', label: 'Sobre' },
    { id: 'planos', label: 'Planos' }, { id: 'contato', label: 'Contato' },
  ]
  return (
    <nav style={{ position: 'sticky', top: 0, zIndex: 100, height: '60px', background: 'color-mix(in srgb, var(--surface) 92%, transparent)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '4px' }}>
          {sections.map(s => (
            <button key={s.id} onClick={() => { setActive(s.id); document.getElementById('landing-' + s.id)?.scrollIntoView({ behavior: 'smooth' }) }} style={{ padding: '7px 16px', borderRadius: '8px', border: 'none', background: active === s.id ? 'var(--surface-2)' : 'transparent', color: active === s.id ? 'var(--text)' : 'var(--text-muted)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
              {s.label}
            </button>
          ))}
        </div>
        <button onClick={() => navigate('auth')} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          Área do Cliente
        </button>
      </div>
    </nav>
  )
}

function LandingScreen({ navigate }) {
  const [selectedPlan, setSelectedPlan] = React.useState(null)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>
      <NavBar navigate={navigate} />

      {/* Hero */}
      <section id="landing-home" style={{ padding: '80px 40px 64px', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '20px', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, marginBottom: '24px', letterSpacing: '.4px' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Plataforma fiscal B2B
        </div>
        <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.12, marginBottom: '20px', letterSpacing: '-0.5px' }}>
          Validação de NF-e e NFC-e <span style={{ color: 'var(--accent)' }}>direto na SEFAZ oficial</span>
        </h1>
        <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 36px' }}>
          Consulte notas fiscais com rastreabilidade, auditoria e acompanhamento financeiro em uma plataforma feita para dar mais clareza, segurança e confiança à sua rotina.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button onClick={() => document.getElementById('landing-planos')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '13px 28px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '9px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            Começar gratuitamente
          </button>
          <button onClick={() => document.getElementById('landing-planos')?.scrollIntoView({ behavior: 'smooth' })} style={{ padding: '13px 28px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-bright)', borderRadius: '9px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
            Ver planos →
          </button>
        </div>
      </section>

      {/* Hero product illustration */}
      <div style={{ maxWidth: '920px', margin: '-8px auto 0', padding: '0 40px 0' }}>
        <div style={{ position: 'relative', borderRadius: '20px 20px 0 0', overflow: 'hidden', border: '1px solid var(--border-bright)', borderBottom: 'none', boxShadow: '0 -4px 60px rgba(0,212,170,0.10), 0 30px 80px rgba(0,0,0,0.5)' }}>
          {/* Browser chrome bar */}
          <div style={{ background: 'var(--surface-2)', padding: '10px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c, opacity: 0.7 }} />)}
            </div>
            <div style={{ flex: 1, background: 'var(--surface-3)', borderRadius: '6px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '8px', maxWidth: '320px', margin: '0 auto' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent)', opacity: 0.6, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>app.validaenota.com.br</span>
            </div>
          </div>

          {/* App shell preview */}
          <div style={{ display: 'flex', height: '420px', background: 'var(--bg)', backgroundImage: 'radial-gradient(circle at top left, rgba(0,212,170,0.07), transparent 30%), radial-gradient(circle at top right, rgba(59,130,246,0.05), transparent 20%)' }}>
            {/* Mini sidebar */}
            <div style={{ width: '180px', flexShrink: 0, background: 'color-mix(in srgb, var(--surface) 94%, transparent)', borderRight: '1px solid var(--border)', padding: '14px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ padding: '8px 10px 14px', borderBottom: '1px solid var(--border)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)' }} />
                </div>
                <span style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)' }}>Painel</span>
              </div>
              {[{label:'Dashboard',active:true},{label:'Auditoria',active:false},{label:'Extrato',active:false},{label:'Créditos',active:false},{label:'Simulador',active:false}].map(item => (
                <div key={item.label} style={{ padding: '8px 10px', borderRadius: '10px', background: item.active ? 'var(--accent-dim)' : 'transparent', border: item.active ? '1px solid var(--accent-glow)' : '1px solid transparent', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: 'var(--surface-2)', border: '1px solid var(--border)', flexShrink: 0 }} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: item.active ? 'var(--accent)' : 'var(--text-muted)' }}>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Main content */}
            <div style={{ flex: 1, overflowY: 'hidden', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Balance hero */}
              <div style={{ borderRadius: '16px', background: 'linear-gradient(135deg, #0f1915, #0b1110 60%, #101b17)', border: '1px solid rgba(0,212,170,0.18)', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.18), transparent 70%)', pointerEvents: 'none' }} />
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)', marginBottom: '8px' }}>Saldo disponível</div>
                  <div style={{ fontFamily: 'var(--font-mono)', color: '#f4fffb', lineHeight: 1 }}>
                    <span style={{ fontSize: '13px', opacity: 0.65, marginRight: '4px' }}>R$</span>
                    <span style={{ fontSize: '34px', fontWeight: 600, letterSpacing: '-0.03em' }}>157,70</span>
                  </div>
                  <div style={{ marginTop: '12px', height: '4px', width: '200px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '21%', borderRadius: '999px', background: 'linear-gradient(90deg, var(--accent), #5eead4)' }} />
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '9px', color: 'rgba(226,244,239,0.6)' }}>21% do saldo comprometido · 1.847 consultas</div>
                </div>
                <div style={{ background: 'rgba(10,16,15,0.55)', border: '1px solid rgba(0,212,170,0.14)', borderRadius: '12px', padding: '14px 16px', minWidth: '140px' }}>
                  <div style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(226,244,239,0.55)', marginBottom: '6px' }}>Situação</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f4fffb', marginBottom: '10px' }}>Créditos ativos</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    {[['Consultas','1.847'],['Expira','23 dias']].map(([l,v]) => (
                      <div key={l} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '8px', padding: '8px' }}>
                        <div style={{ fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(226,244,239,0.5)', marginBottom: '3px' }}>{l}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', fontWeight: 600, color: '#f4fffb' }}>{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* KPIs row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {[
                  { label: 'Consultas hoje', value: '247', tone: 'var(--accent)', featured: true },
                  { label: 'No período', value: '1.847', tone: 'var(--info)', featured: true },
                  { label: 'Saldo usado', value: 'R$ 42,30', tone: 'var(--warn)', featured: false },
                  { label: 'Status', value: 'ATIVO', tone: 'var(--accent)', featured: false },
                ].map(k => (
                  <div key={k.label} style={{ background: 'var(--surface)', border: k.featured ? `1px solid color-mix(in srgb, ${k.tone} 22%, var(--border))` : '1px solid var(--border)', borderRadius: '8px', padding: '12px', position: 'relative', overflow: 'hidden' }}>
                    {k.featured && <div style={{ position: 'absolute', inset: '0 auto 0 0', width: '3px', background: `linear-gradient(180deg, ${k.tone}, color-mix(in srgb, #3b82f6 70%, ${k.tone}))` }} />}
                    <div style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px', paddingLeft: k.featured ? '4px' : 0 }}>{k.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '16px', fontWeight: 600, color: k.tone, paddingLeft: k.featured ? '4px' : 0 }}>{k.value}</div>
                  </div>
                ))}
              </div>

              {/* Mini audit table */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', flex: 1 }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '-0.01em' }}>Últimas auditorias</span>
                  <span style={{ fontSize: '10px', padding: '3px 10px', borderRadius: '999px', background: 'var(--accent-dim)', color: 'var(--accent)', fontWeight: 700, border: '1px solid var(--accent-glow)' }}>Ver todas →</span>
                </div>
                <div>
                  {[
                    { chave: '3525041234…6789', modelo: 'NF-e', status: 'Autorizada', cor: 'var(--accent)', bgCor: 'var(--accent-dim)', data: '24/04/2026' },
                    { chave: '3525049876…0012', modelo: 'NF-Ce', status: 'Autorizada', cor: 'var(--accent)', bgCor: 'var(--accent-dim)', data: '24/04/2026' },
                    { chave: '3525041111…3344', modelo: 'NF-e', status: 'Cancelada', cor: 'var(--danger)', bgCor: 'var(--danger-dim)', data: '23/04/2026' },
                  ].map((row, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto auto auto', gap: '12px', padding: '8px 14px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>{row.chave}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: row.modelo === 'NF-e' ? 'var(--info-dim)' : 'var(--accent-dim)', color: row.modelo === 'NF-e' ? 'var(--info)' : 'var(--accent)' }}>{row.modelo}</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 7px', borderRadius: '999px', fontSize: '9px', fontWeight: 600, background: row.bgCor, color: row.cor }}>
                        <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                        {row.status}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-dim)' }}>{row.data}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom fade */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(to top, var(--bg), transparent)', pointerEvents: 'none' }} />
        </div>
      </div>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />

      {/* Como funciona */}
      <section style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionLabel>Como funciona</SectionLabel>
        <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px', marginBottom: '36px' }}>Da consulta ao resultado auditável</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {STEPS.map(s => (
            <div key={s.num} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px 18px' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent)', marginBottom: '14px' }}>{s.num}</div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />

      {/* Sobre */}
      <section id="landing-sobre" style={{ padding: '64px 40px', maxWidth: '960px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <SectionLabel>Sobre</SectionLabel>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '16px' }}>Criamos infraestrutura fiscal para dar mais clareza e confiança às empresas</h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '700px', margin: '0 auto' }}>Nascemos de um problema real: a burocracia travando empresas todos os dias.</p>
        </div>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '18px', padding: '30px', boxShadow: 'var(--shadow)', marginBottom: '24px' }}>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.85, margin: 0 }}>Depois de lidar de perto com a lentidão, as inconsistências e a complexidade dos serviços da SEFAZ, especialmente no Rio de Janeiro, decidimos parar de aceitar o "jeito que sempre foi feito" e construir algo melhor. Somos uma startup focada em infraestrutura fiscal moderna, criando soluções que validam dados de notas fiscais com precisão, velocidade e confiabilidade.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[{ title: 'Origem prática', desc: 'Nascemos a partir de um problema vivido no dia a dia, com foco em resolver entraves reais da rotina fiscal.' },
            { title: 'Infraestrutura moderna', desc: 'Desenvolvemos soluções com precisão, velocidade e confiabilidade para dar mais segurança às operações.' },
            { title: 'Visão de plataforma', desc: 'Pensamos no produto com clareza, construímos com disciplina e entregamos uma base sólida para crescer.' }
          ].map(p => (
            <div key={p.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '10px' }}>{p.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />

      {/* Planos */}
      <section id="landing-planos" style={{ padding: '56px 40px 64px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <SectionLabel>Planos e preços</SectionLabel>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '14px' }}>Comece com 14 dias grátis</h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Todo plano inclui <strong style={{ color: 'var(--text)' }}>14 dias de trial</strong> com{' '}
            <strong style={{ color: 'var(--accent)' }}>R$ 50,00 em créditos</strong> para testar sem precisar de cartão.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'stretch', marginBottom: '40px' }}>
          {PLANOS.map(plano => {
            const sel = selectedPlan === plano.id
            return (
              <div key={plano.id} style={{ background: plano.destaque ? 'linear-gradient(160deg, color-mix(in srgb, var(--surface) 80%, var(--accent-dim) 20%), var(--surface))' : 'var(--surface)', border: sel ? '2px solid var(--accent)' : plano.isTrial ? '1.5px dashed var(--border)' : plano.destaque ? '2px solid var(--accent-glow)' : '1px solid var(--border)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', position: 'relative', transition: 'transform .2s', cursor: 'pointer' }}
                onClick={() => setSelectedPlan(sel ? null : plano.id)}
                onMouseEnter={e => { if (!sel) e.currentTarget.style.transform = 'scale(1.025)' }}
                onMouseLeave={e => { if (!sel) e.currentTarget.style.transform = 'scale(1)' }}
              >
                {plano.tag && (
                  <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: sel ? 'var(--accent)' : plano.tagColor, color: plano.tagColor === '#3b82f6' ? '#fff' : '#04110d', fontSize: '11px', fontWeight: 700, padding: '3px 12px', borderRadius: '999px', whiteSpace: 'nowrap' }}>
                    {sel ? '✓ Selecionado' : plano.tag}
                  </div>
                )}
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>{plano.nome}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '38px', fontWeight: 700, letterSpacing: '-0.03em', color: plano.isTrial ? '#3b82f6' : plano.destaque ? 'var(--accent)' : 'var(--text)' }}>
                    {plano.preco !== null ? `R$ ${plano.preco}` : 'Grátis'}
                    {plano.preco !== null && <span style={{ fontSize: '13px', color: 'var(--text-dim)', fontWeight: 400 }}>/mês</span>}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {plano.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <span style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button onClick={e => { e.stopPropagation(); navigate('auth') }} style={{ width: '100%', padding: '12px', background: sel || plano.isTrial || plano.destaque ? (plano.isTrial ? '#3b82f6' : 'var(--accent)') : 'var(--surface-2)', color: sel || plano.isTrial || plano.destaque ? '#04110d' : 'var(--text)', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
                  {sel ? '↓ Preencher cadastro' : plano.btnLabel}
                </button>
              </div>
            )
          })}
        </div>
      </section>

      {/* Contato */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section id="landing-contato" style={{ padding: '56px 40px 64px', maxWidth: '680px', margin: '0 auto', textAlign: 'center' }}>
        <SectionLabel>Contato</SectionLabel>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Fale com a gente</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px', lineHeight: 1.7 }}>Dúvidas sobre integração, planos ou funcionamento? Envie uma mensagem.</p>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {[{ label: 'Nome', placeholder: 'Seu nome' }, { label: 'E-mail', placeholder: 'seu@email.com' }].map(f => (
            <div key={f.label}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px' }}>{f.label}</div>
              <input placeholder={f.placeholder} style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 14px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--sans)', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          ))}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '6px' }}>Mensagem</div>
            <textarea rows={4} placeholder="Como podemos ajudar?" style={{ width: '100%', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: '12px', padding: '10px 14px', color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--sans)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
          </div>
          <button style={{ padding: '12px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Enviar mensagem</button>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', textAlign: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 }}>
          © 2026 validaENota. Plataforma de validação fiscal brasileira.<br />
          MAGSI TECH CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA — CNPJ: 66.328.989/0001-75
        </span>
      </footer>
    </div>
  )
}

Object.assign(window, { LandingScreen })
