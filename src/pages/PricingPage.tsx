import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { PublicNav } from '@/components/layout/PublicNav'

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

      <div className="pricing-section pricing-hero" style={{ padding: '56px 40px 40px', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
          Preços transparentes
        </div>
        <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '14px' }}>
          Pague apenas pelo que usar
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Modelo pré-pago com cobrança progressiva cumulativa. O saldo fica disponível por <strong style={{ color: 'var(--text)' }}>30 dias</strong> após a confirmação do pagamento.
          Valor mínimo de recarga: <strong style={{ color: 'var(--accent)' }}>R$ 50,00</strong>.
        </p>
      </div>

      <div className="pricing-section" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 32px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="pricing-card-header" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))', borderBottom: '1px solid var(--border)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Tabela de faixas com cobrança progressiva</h2>
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

      <div className="pricing-grid-2 pricing-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto', padding: '0 40px 56px' }}>
        <InfoBox title="Como funciona a cobrança progressiva">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            O custo acompanha o volume acumulado no período. Conforme o uso cresce, o valor unitário diminui.
          </p>
        </InfoBox>
        <InfoBox title="Adicional fixo de R$ 0,03">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Aplicado em todas as faixas e já incluído nos preços finais da tabela acima.
          </p>
        </InfoBox>
        <InfoBox title="Créditos pré-pagos">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Compra via PIX ou boleto, com saldo válido por 30 dias após a confirmação do pedido.
          </p>
        </InfoBox>
        <InfoBox title="Cache e deduplicação inteligente">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Consultas repetidas da mesma nota não geram novo débito dentro da janela de cache.
          </p>
        </InfoBox>
      </div>

      <div style={{ textAlign: 'center', padding: '0 40px 64px' }}>
        <button
          type="button"
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
          Ir para a Área do Cliente
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
