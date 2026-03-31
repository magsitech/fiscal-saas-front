import { useNavigate } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const FAIXAS = [
  { range: '1 - 500', base: 'R$ 0,19', fixed: 'R$ 0,03', final: 'R$ 0,22', pct: 100 },
  { range: '501 - 2.000', base: 'R$ 0,15', fixed: 'R$ 0,03', final: 'R$ 0,18', pct: 82 },
  { range: '2.001 - 5.000', base: 'R$ 0,13', fixed: 'R$ 0,03', final: 'R$ 0,16', pct: 73 },
  { range: '5.001 - 10.000', base: 'R$ 0,12', fixed: 'R$ 0,03', final: 'R$ 0,15', pct: 68 },
  { range: '10.001 - 30.000', base: 'R$ 0,10', fixed: 'R$ 0,03', final: 'R$ 0,13', pct: 59 },
  { range: '30.001 - 50.000', base: 'R$ 0,09', fixed: 'R$ 0,03', final: 'R$ 0,12', pct: 55 },
  { range: '50.001 - 80.000', base: 'R$ 0,08', fixed: 'R$ 0,03', final: 'R$ 0,11', pct: 50 },
]

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>
      <nav className="pricing-nav" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: '60px', background: 'rgba(10,12,15,0.97)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div className="pricing-brand" style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: '#000' }}>VN</div>
          <span style={{ fontSize: '15px', fontWeight: 700 }}>validaeNota</span>
        </div>
        <div className="pricing-nav-links" style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <NavBtn label="Home" onClick={() => navigate('/')} />
          <NavBtn label="Pricing" active onClick={() => navigate('/pricing')} />
        </div>
        <div className="pricing-brand"><ThemeToggle /></div>
        <div className="pricing-nav-cta">
          <button onClick={() => navigate('/login')} style={{ padding: '8px 20px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)' }}>Area do Cliente</button>
        </div>
      </nav>

      <div className="pricing-section pricing-hero" style={{ padding: '56px 40px 40px', textAlign: 'center', maxWidth: '680px', margin: '0 auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>Precos transparentes</div>
        <h1 style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '14px' }}>Pague apenas pelo que usar</h1>
        <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
          Modelo pre-pago com cobranca progressiva cumulativa. Saldo valido por <strong style={{ color: 'var(--text)' }}>30 dias</strong> apos confirmacao do pagamento. Valor minimo de recarga: <strong style={{ color: 'var(--accent)' }}>R$ 50,00</strong>.
        </p>
      </div>

      <div className="pricing-section" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 32px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
          <div className="pricing-card-header" style={{ background: 'linear-gradient(135deg,#0e1a14,#0a1410)', borderBottom: '1px solid rgba(0,212,170,.2)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Tabela de faixas - cobranca progressiva cumulativa</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quanto mais consultas no periodo, menor o custo por consulta</p>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
              + R$ 0,03 fixo por consulta
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
              <thead>
                <tr>
                  {['Faixa', 'Preco base', '+ Fixo', 'Custo final', 'Escala'].map((h) => (
                    <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FAIXAS.map((f) => (
                  <tr key={f.range}>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{f.range}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{f.base}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{f.fixed}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{f.final}</td>
                    <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ width: '140px', height: '5px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${f.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
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
        <InfoBox title="Como funciona a cobranca cumulativa">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            O modelo e identico ao usado por AWS, GCP e Azure. Cada faixa e cobrada integralmente antes de avancar para a proxima.
          </p>
        </InfoBox>
        <InfoBox title="Adicional fixo de R$ 0,03">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Aplicado em todas as faixas e ja incluso nos precos finais da tabela acima.
          </p>
        </InfoBox>
        <InfoBox title="Saldo pre-pago">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Compra via PIX ou boleto, com saldo valido por 30 dias apos confirmacao.
          </p>
        </InfoBox>
        <InfoBox title="Cache e deduplicacao inteligente">
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: '12px' }}>
            Consultas repetidas da mesma NF nao debitam novamente o saldo dentro da janela de cache.
          </p>
        </InfoBox>
      </div>
    </div>
  )
}

function NavBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '7px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500, color: active ? 'var(--text)' : 'var(--text-muted)', background: active ? 'var(--surface-2)' : 'transparent', border: 'none', fontFamily: 'var(--sans)' }}
    >
      {label}
    </button>
  )
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>{title}</h3>
      {children}
    </div>
  )
}
