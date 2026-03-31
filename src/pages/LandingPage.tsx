import { useNavigate } from 'react-router-dom'

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}
function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

const VANTAGENS = [
  {
    icon: <ShieldIcon />,
    title: '100% oficial SEFAZ',
    desc: 'Integração exclusiva via Web Services NFeConsultaProtocolo. Nenhum portal de terceiros, nenhum scraping — resultado com validade legal.',
  },
  {
    icon: <ActivityIcon />,
    title: 'Anti-bloqueio garantido',
    desc: 'Arquitetura com fila RabbitMQ, rate limiting de 1 req/1,5s e SSLContext reutilizado. Certificado A1 ICP-Brasil em produção.',
  },
  {
    icon: <ClockIcon />,
    title: 'Cache inteligente de 7 dias',
    desc: 'Resultados armazenados no Redis por 7 dias. Consultas repetidas não debitam saldo — sua equipe nunca paga duas vezes pela mesma NF.',
  },
  {
    icon: <DollarIcon />,
    title: 'Cobrança progressiva',
    desc: 'Modelo de escada cumulativa: quanto mais consultas no período, menor o custo unitário. Similar ao modelo de AWS, GCP e Azure.',
  },
  {
    icon: <MonitorIcon />,
    title: 'Painel de gestão completo',
    desc: 'Dashboard com histórico fiscal, auditoria de consumo, simulador de custos, compra de créditos via PIX ou boleto.',
  },
  {
    icon: <UsersIcon />,
    title: 'Multi-tenant seguro',
    desc: 'Cada gestor tem saldo isolado, histórico próprio e empresas vinculadas. Ideal para programas de nota fiscal de prefeituras.',
  },
]

const STEPS = [
  {
    num: '01',
    title: 'Leitura do QR Code',
    desc: 'Seu app lê o QR Code ou código de barras da NF-e (modelo 55) ou NFC-e (modelo 65) e envia à nossa API.',
  },
  {
    num: '02',
    title: 'Envio à API',
    desc: 'Sua aplicação envia a URL do QR Code, CNPJ do emitente, CPF do destinatário e valor total da nota.',
  },
  {
    num: '03',
    title: 'Consulta oficial',
    desc: 'Consultamos exclusivamente os Web Services SEFAZ via SOAP com certificado digital A1. Sem portais, sem scraping.',
  },
  {
    num: '04',
    title: 'Resultado validado',
    desc: 'Retornamos status, protocolo, valores e dados completos da nota. Cache de 7 dias evita cobranças duplicadas.',
  },
]

const STATS = [
  { value: '27', label: 'UFs suportadas' },
  { value: '99,9%', label: 'Uptime garantido' },
  { value: '7 dias', label: 'Cache de resultados' },
  { value: '1,5s', label: 'Rate limit seguro' },
]

export function LandingPage() {
  const navigate = useNavigate()

  return (
    <div
      style={{
        background: 'var(--bg)',
        color: 'var(--text)',
        fontFamily: 'var(--sans)',
        minHeight: '100vh',
      }}
    >
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          height: '60px',
          background: 'rgba(10,12,15,0.97)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '32px', height: '32px',
              background: 'var(--accent)',
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: '#000',
            }}
          >
            VN
          </div>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>validaeNota</span>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <NavLink to="/" label="Home" />
          <NavLink to="/pricing" label="Pricing" />
        </div>

        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '8px 20px',
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
          }}
        >
          Área do Cliente
        </button>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section
        style={{
          padding: '80px 40px 64px',
          textAlign: 'center',
          maxWidth: '860px',
          margin: '0 auto',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '7px',
            padding: '5px 14px',
            borderRadius: '20px',
            border: '1px solid var(--accent-glow)',
            background: 'var(--accent-dim)',
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '24px',
            letterSpacing: '.4px',
          }}
        >
          <span
            style={{
              width: '7px', height: '7px',
              borderRadius: '50%',
              background: 'var(--accent)',
              animation: 'pulse 2s infinite',
              display: 'inline-block',
            }}
          />
          Plataforma SaaS Fiscal B2B
        </div>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: 700,
            lineHeight: 1.12,
            marginBottom: '20px',
            letterSpacing: '-0.5px',
          }}
        >
          Validação de NF-e e NFC-e{' '}
          <span style={{ color: 'var(--accent)' }}>direto na SEFAZ oficial</span>
        </h1>

        <p
          style={{
            fontSize: '17px',
            color: 'var(--text-muted)',
            lineHeight: 1.7,
            maxWidth: '580px',
            margin: '0 auto 36px',
          }}
        >
          Consulte notas fiscais em tempo real via Web Services oficiais da Receita Federal.
          Sem scraping, sem portais, sem riscos — só resultado confiável para sua prefeitura
          ou empresa.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '13px 28px',
              background: 'var(--accent)',
              color: '#000',
              border: 'none',
              borderRadius: '9px',
              fontSize: '15px',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
            }}
          >
            Começar gratuitamente
          </button>
          <button
            onClick={() => navigate('/pricing')}
            style={{
              padding: '13px 28px',
              background: 'transparent',
              color: 'var(--text)',
              border: '1px solid var(--border-bright)',
              borderRadius: '9px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'var(--sans)',
            }}
          >
            Ver preços →
          </button>
        </div>
      </section>

      {/* ── Como funciona ───────────────────────────────────── */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader label="Como funciona" title="Do QR Code ao resultado em segundos" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '36px',
          }}
        >
          {STEPS.map((s) => (
            <div
              key={s.num}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '22px 18px',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  marginBottom: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    width: '20px', height: '20px',
                    borderRadius: '50%',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-glow)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                  }}
                >
                  {s.num}
                </span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{s.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Vantagens ───────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader label="Vantagens" title="Por que escolher o validaeNota" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '36px',
          }}
        >
          {VANTAGENS.map((v) => (
            <div
              key={v.title}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '22px',
              }}
            >
              <div
                style={{
                  width: '38px', height: '38px',
                  borderRadius: '10px',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-glow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent)',
                  marginBottom: '16px',
                }}
              >
                {v.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{v.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ───────────────────────────────────────────── */}
      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader label="Números" title="Plataforma confiável em produção" />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '16px',
            marginTop: '36px',
          }}
        >
          {STATS.map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '28px 20px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '32px',
                  fontWeight: 700,
                  color: 'var(--accent)',
                  lineHeight: 1,
                  marginBottom: '10px',
                }}
              >
                {s.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA strip ───────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0e1a14, #0a1410)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '56px 40px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>
          Pronto para validar suas notas fiscais?
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
          Crie sua conta em menos de 2 minutos. Sem cartão de crédito para começar.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '13px 32px',
            background: 'var(--accent)',
            color: '#000',
            border: 'none',
            borderRadius: '9px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--sans)',
          }}
        >
          Criar conta gratuitamente
        </button>
      </div>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '26px', height: '26px',
              background: 'var(--accent)',
              borderRadius: '6px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700, color: '#000',
            }}
          >
            VN
          </div>
          <span style={{ fontSize: '13px', fontWeight: 700 }}>validaeNota</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
          © 2025 validaeNota. Plataforma de validação fiscal brasileira.
        </span>
      </footer>
    </div>
  )
}

/* ── Sub-components ──────────────────────────────────────────── */
function NavLink({ to, label }: { to: string; label: string }) {
  const navigate = useNavigate()
  const active = window.location.pathname === to

  return (
    <button
      onClick={() => navigate(to)}
      style={{
        padding: '7px 16px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: 500,
        color: active ? 'var(--text)' : 'var(--text-muted)',
        background: active ? 'var(--surface-2)' : 'transparent',
        border: 'none',
        fontFamily: 'var(--sans)',
        transition: 'all .15s',
      }}
    >
      {label}
    </button>
  )
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <>
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '1.2px',
          textTransform: 'uppercase',
          color: 'var(--accent)',
          marginBottom: '10px',
        }}
      >
        {label}
      </div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h2>
    </>
  )
}
