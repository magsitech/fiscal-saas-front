import { useNavigate } from 'react-router-dom'
import { PublicNav } from '@/components/layout/PublicNav'

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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
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
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

const VANTAGENS = [
  {
    icon: <ShieldIcon />,
    title: '100% oficial SEFAZ',
    desc: 'Integração exclusiva via Web Services NFeConsultaProtocolo. Nenhum portal de terceiros, nenhum scraping, só resultado com validade legal.',
  },
  {
    icon: <ActivityIcon />,
    title: 'Anti-bloqueio garantido',
    desc: 'Arquitetura com fila RabbitMQ, rate limiting de 1 req/1,5s e SSLContext reutilizado. Certificado A1 ICP-Brasil em produção.',
  },
  {
    icon: <ClockIcon />,
    title: 'Cache inteligente de 7 dias',
    desc: 'Resultados armazenados no Redis por 7 dias. Consultas repetidas não debitam saldo e sua equipe nunca paga duas vezes pela mesma NF.',
  },
  {
    icon: <DollarIcon />,
    title: 'Cobrança progressiva',
    desc: 'Modelo de escada cumulativa: quanto mais consultas no período, menor o custo unitário. Similar ao modelo de AWS, GCP e Azure.',
  },
  {
    icon: <MonitorIcon />,
    title: 'Painel de gestão completo',
    desc: 'Dashboard com histórico fiscal, auditoria de consumo, simulador de custos e compra de créditos via PIX ou boleto.',
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
    desc: 'Seu app lê o QR Code ou código de barras da NF-e ou NFC-e e envia para a nossa API.',
  },
  {
    num: '02',
    title: 'Envio à API',
    desc: 'Sua aplicação envia a URL do QR Code, CNPJ do emitente, CPF do destinatário e valor total da nota.',
  },
  {
    num: '03',
    title: 'Consulta oficial',
    desc: 'Consultamos exclusivamente os Web Services da SEFAZ via SOAP com certificado digital A1.',
  },
  {
    num: '04',
    title: 'Resultado validado',
    desc: 'Retornamos status, protocolo, valores e dados completos da nota. O cache evita cobranças duplicadas.',
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
      <PublicNav current="home" />

      <section
        className="landing-section landing-hero"
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
              width: '7px',
              height: '7px',
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
          Validação de NF-e e NFC-e <span style={{ color: 'var(--accent)' }}>direto na SEFAZ oficial</span>
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
          Consulte notas fiscais em tempo real via Web Services oficiais da Receita Federal. Sem scraping, sem
          portais, sem riscos, só resultado confiável para sua prefeitura ou empresa.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '13px 28px',
              background: 'var(--accent)',
              color: '#04110d',
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

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section className="landing-section" style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader label="Como funciona" title="Do QR Code ao resultado em segundos" />
        <div
          className="landing-grid-4"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '36px' }}
        >
          {STEPS.map((step) => (
            <div
              key={step.num}
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
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    background: 'var(--accent-dim)',
                    border: '1px solid var(--accent-glow)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                  }}
                >
                  {step.num}
                </span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section className="landing-section" style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader label="Vantagens" title="Por que escolher o validaeNota" />
        <div
          className="landing-grid-3"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '36px' }}
        >
          {VANTAGENS.map((vantagem) => (
            <div
              key={vantagem.title}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '22px',
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
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
                {vantagem.icon}
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{vantagem.title}</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{vantagem.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
      <section className="landing-section" style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
        <SectionHeader label="Números" title="Plataforma confiável em produção" />
        <div
          className="landing-grid-4"
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginTop: '36px' }}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
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
                {stat.value}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '56px 40px',
          textAlign: 'center',
        }}
      >
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Pronto para validar suas notas fiscais?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
          Crie sua conta em menos de 2 minutos. Sem cartão de crédito para começar.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            padding: '13px 32px',
            background: 'var(--accent)',
            color: '#04110d',
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

      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '28px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center' }}>
          © 2026 validaeNota. Plataforma de validação fiscal brasileira.
        </span>
      </footer>
    </div>
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
