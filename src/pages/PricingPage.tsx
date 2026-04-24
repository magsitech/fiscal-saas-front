import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check } from 'lucide-react'
import { PublicNav } from '@/components/layout/PublicNav'

const PLANOS = [
  {
    id: 'TRIAL',
    nome: 'Trial',
    preco: null,
    descricao: 'Experimente a plataforma sem compromisso. Sem cartão.',
    features: [
      '14 dias de acesso completo',
      'R$ 50,00 em créditos incluídos',
      'Validação NF-e e NFC-e',
      'Dashboard e relatórios',
      'Sem cartão de crédito',
    ],
    destaque: false,
    badge: '14 dias grátis',
    btnLabel: 'Começar grátis',
    isTrial: true,
  },
  {
    id: 'BASICO',
    nome: 'Básico',
    preco: 29,
    descricao: 'Ideal para volumes baixos e testes em produção.',
    features: [
      'Validação NF-e e NFC-e',
      'Cobrança pré-paga por uso',
      'R$ 0,22 fixo por consulta',
      'Sem desconto por volume',
      'Suporte por e-mail',
    ],
    destaque: false,
    badge: null,
    btnLabel: 'Assinar Básico',
    isTrial: false,
  },
  {
    id: 'PRO',
    nome: 'Pro',
    preco: 99,
    descricao: 'Para empresas com volume regular de notas fiscais.',
    features: [
      '500 consultas/mês incluídas',
      'Excedente com cobrança progressiva',
      'Validação NF-e e NFC-e',
      'Dashboard e relatórios',
      'Suporte prioritário',
    ],
    destaque: true,
    badge: 'Mais popular',
    btnLabel: 'Assinar Pro',
    isTrial: false,
  },
  {
    id: 'BUSINESS',
    nome: 'Business',
    preco: 149,
    descricao: 'Para alto volume com melhor custo no excedente.',
    features: [
      '1.000 consultas/mês incluídas',
      'Excedente começa na faixa 2 (−18%)',
      'Validação NF-e e NFC-e',
      'Webhook por consulta',
      'Suporte prioritário + SLA',
    ],
    destaque: false,
    badge: null,
    btnLabel: 'Assinar Business',
    isTrial: false,
  },
]

const FAIXAS = [
  { range: '1 - 500', base: 'R$ 0,19', fixed: 'R$ 0,03', final: 'R$ 0,22', pct: 100 },
  { range: '501 - 2.000', base: 'R$ 0,15', fixed: 'R$ 0,03', final: 'R$ 0,18', pct: 82 },
  { range: '2.001 - 5.000', base: 'R$ 0,13', fixed: 'R$ 0,03', final: 'R$ 0,16', pct: 73 },
  { range: '5.001 - 10.000', base: 'R$ 0,12', fixed: 'R$ 0,03', final: 'R$ 0,15', pct: 68 },
  { range: '10.001 - 30.000', base: 'R$ 0,10', fixed: 'R$ 0,03', final: 'R$ 0,13', pct: 59 },
  { range: '30.001 - 50.000', base: 'R$ 0,09', fixed: 'R$ 0,03', final: 'R$ 0,12', pct: 55 },
  { range: '50.001+', base: 'R$ 0,08', fixed: 'R$ 0,03', final: 'R$ 0,11', pct: 50 },
]

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>
      <PublicNav current="pricing" />

      {/* Hero */}
      <div className="pricing-section pricing-hero" style={{ padding: '56px 40px 40px', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
          Planos e preços
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '14px' }}>
          Comece com 14 dias grátis
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Todo plano inclui <strong style={{ color: 'var(--text)' }}>14 dias de trial</strong> com{' '}
          <strong style={{ color: 'var(--accent)' }}>R$ 50,00 em créditos</strong> para testar sem precisar de cartão.
          Após o trial, escolha o plano que melhor se encaixa no seu volume.
        </p>
      </div>

      {/* Cards de planos */}
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 40px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', alignItems: 'start' }} className="pricing-plans-grid">
        {PLANOS.map((plano) => (
          <div
            key={plano.id}
            style={{
              background: plano.destaque ? 'linear-gradient(160deg, color-mix(in srgb, var(--surface) 80%, var(--accent-dim) 20%), var(--surface))' : 'var(--surface)',
              border: plano.isTrial ? '1.5px dashed var(--border)' : plano.destaque ? '2px solid var(--accent-glow)' : '1px solid var(--border)',
              borderRadius: '16px',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
              position: 'relative',
            }}
          >
            {plano.badge && (
              <div style={{
                position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                background: plano.isTrial ? 'var(--info, #3b82f6)' : 'var(--accent)',
                color: plano.isTrial ? '#fff' : '#04110d',
                fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px',
                padding: '3px 12px', borderRadius: '999px', whiteSpace: 'nowrap',
              }}>
                {plano.badge}
              </div>
            )}

            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>
                {plano.nome}
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '8px' }}>
                {plano.preco !== null ? (
                  <>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '38px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: plano.destaque ? 'var(--accent)' : 'var(--text)' }}>
                      R$ {plano.preco}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)', paddingBottom: '5px' }}>/mês</span>
                  </>
                ) : (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '38px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--info, #3b82f6)' }}>
                    Grátis
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{plano.descricao}</p>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plano.features.map((f) => (
                <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <Check size={14} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: '1px' }} />
                  {f}
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/login?plano=${plano.id}`)}
              style={{
                width: '100%',
                padding: '12px',
                background: plano.isTrial ? 'var(--info, #3b82f6)' : plano.destaque ? 'var(--accent)' : 'var(--surface-2)',
                color: plano.isTrial ? '#fff' : plano.destaque ? '#04110d' : 'var(--text)',
                border: plano.isTrial || plano.destaque ? 'none' : '1px solid var(--border)',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'var(--sans)',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              {plano.btnLabel}
            </button>
          </div>
        ))}
      </div>

      {/* Tabela de faixas — cobrança por excedente */}
      <div className="pricing-section" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px' }}>
            Cobrança por uso
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Excedente após a franquia</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
            Quando o volume supera a franquia incluída, o excedente é cobrado de forma progressiva e cumulativa.
            O plano Básico aplica R$ 0,22 fixo sem progressão.
          </p>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="pricing-card-header" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))', borderBottom: '1px solid var(--border)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Tabela de faixas com cobrança progressiva</h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quanto mais consultas no período, menor o custo por validação.</p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
              + R$ 0,03 fixo por consulta
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr>
                  {['Faixa', 'Preço base', '+ fixo', 'Custo final', 'Escala'].map((header) => (
                    <th key={header} style={{ textAlign: 'left', padding: '11px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FAIXAS.map((faixa) => (
                  <tr key={faixa.range}>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{faixa.range}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{faixa.base}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{faixa.fixed}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{faixa.final}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '140px', height: '5px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${faixa.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Info boxes */}
      <div className="pricing-grid-2 pricing-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto', padding: '0 40px 56px' }}>
        <InfoBox title="Franquia inclusa no plano">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Pro e Business incluem consultas mensais sem custo adicional. Ao atingir o limite, o excedente é cobrado pelas faixas progressivas.
          </p>
        </InfoBox>
        <InfoBox title="Cobrança progressiva cumulativa">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            O custo acompanha o volume acumulado. Conforme o uso cresce, o valor unitário diminui automaticamente.
          </p>
        </InfoBox>
        <InfoBox title="Créditos pré-pagos">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            O excedente é descontado do saldo pré-pago. Recarregue via PIX ou boleto, com saldo válido por 30 dias.
          </p>
        </InfoBox>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
          © 2026 validaENota. Plataforma de validação fiscal brasileira.
          <br />
          MAGSI TECH CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA - CNPJ: 66.328.989/0001-75
        </span>
      </footer>
    </div>
  )
}

function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>{title}</h3>
      {children}
    </div>
  )
}
