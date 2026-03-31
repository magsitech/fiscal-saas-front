import { useNavigate } from 'react-router-dom'

const FAIXAS = [
  { range: '1 – 500',          base: 'R$ 0,19', fixed: 'R$ 0,03', final: 'R$ 0,22', pct: 100 },
  { range: '501 – 2.000',      base: 'R$ 0,15', fixed: 'R$ 0,03', final: 'R$ 0,18', pct: 82  },
  { range: '2.001 – 5.000',    base: 'R$ 0,13', fixed: 'R$ 0,03', final: 'R$ 0,16', pct: 73  },
  { range: '5.001 – 10.000',   base: 'R$ 0,12', fixed: 'R$ 0,03', final: 'R$ 0,15', pct: 68  },
  { range: '10.001 – 30.000',  base: 'R$ 0,10', fixed: 'R$ 0,03', final: 'R$ 0,13', pct: 59  },
  { range: '30.001 – 50.000',  base: 'R$ 0,09', fixed: 'R$ 0,03', final: 'R$ 0,12', pct: 55  },
  { range: '50.001 – 80.000',  base: 'R$ 0,08', fixed: 'R$ 0,03', final: 'R$ 0,11', pct: 50  },
]

export function PricingPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>

      {/* ── Navbar (replicada da landing) ─────────────────── */}
      <nav style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 40px', height:'60px', background:'rgba(10,12,15,0.97)', borderBottom:'1px solid var(--border)', position:'sticky', top:0, zIndex:100 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', cursor:'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width:'32px', height:'32px', background:'var(--accent)', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:'12px', fontWeight:700, color:'#000' }}>VN</div>
          <span style={{ fontSize:'15px', fontWeight:700 }}>validaeNota</span>
        </div>
        <div style={{ display:'flex', gap:'4px' }}>
          <NavBtn label="Home" onClick={() => navigate('/')} />
          <NavBtn label="Pricing" active onClick={() => navigate('/pricing')} />
        </div>
        <button onClick={() => navigate('/login')} style={{ padding:'8px 20px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'8px', fontSize:'13px', fontWeight:700, cursor:'pointer', fontFamily:'var(--sans)' }}>Área do Cliente</button>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ padding:'56px 40px 40px', textAlign:'center', maxWidth:'680px', margin:'0 auto' }}>
        <div style={{ fontSize:'11px', fontWeight:700, letterSpacing:'1.2px', textTransform:'uppercase', color:'var(--accent)', marginBottom:'10px' }}>Preços transparentes</div>
        <h1 style={{ fontSize:'40px', fontWeight:700, letterSpacing:'-0.4px', marginBottom:'14px' }}>Pague apenas pelo que usar</h1>
        <p style={{ fontSize:'15px', color:'var(--text-muted)', lineHeight:1.7 }}>
          Modelo pré-pago com cobrança progressiva cumulativa. Saldo válido por{' '}
          <strong style={{ color:'var(--text)' }}>30 dias</strong> após confirmação do pagamento.
          Valor mínimo de recarga: <strong style={{ color:'var(--accent)' }}>R$ 50,00</strong>.
        </p>
      </div>

      {/* ── Tabela de faixas ─────────────────────────────── */}
      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'0 40px 32px' }}>
        <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', overflow:'hidden' }}>

          {/* Header do card */}
          <div style={{ background:'linear-gradient(135deg,#0e1a14,#0a1410)', borderBottom:'1px solid rgba(0,212,170,.2)', padding:'24px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div>
              <h2 style={{ fontSize:'17px', fontWeight:700, marginBottom:'4px' }}>Tabela de faixas — cobrança progressiva cumulativa</h2>
              <p style={{ fontSize:'13px', color:'var(--text-muted)' }}>Quanto mais consultas no período, menor o custo por consulta</p>
            </div>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'5px', padding:'4px 12px', borderRadius:'20px', background:'var(--accent-dim)', border:'1px solid var(--accent-glow)', color:'var(--accent)', fontSize:'12px', fontWeight:700, whiteSpace:'nowrap' }}>
              + R$ 0,03 fixo por consulta
            </div>
          </div>

          {/* Tabela */}
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  {['Faixa (consultas acumuladas)','Preço base','+ Adicional fixo','Custo final / consulta','Escala visual'].map(h => (
                    <th key={h} style={{ textAlign:'left', padding:'11px 20px', fontSize:'11px', fontWeight:700, letterSpacing:'.6px', textTransform:'uppercase', color:'var(--text-dim)', background:'var(--surface-2)', borderBottom:'1px solid var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FAIXAS.map((f) => (
                  <tr key={f.range} style={{ cursor:'default' }}>
                    <td style={{ padding:'13px 20px', borderBottom:'1px solid var(--border)', fontSize:'13px', fontWeight:600, color:'var(--text)' }}>{f.range}</td>
                    <td style={{ padding:'13px 20px', borderBottom:'1px solid var(--border)', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--text-muted)' }}>{f.base}</td>
                    <td style={{ padding:'13px 20px', borderBottom:'1px solid var(--border)', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--text-muted)' }}>{f.fixed}</td>
                    <td style={{ padding:'13px 20px', borderBottom:'1px solid var(--border)', fontFamily:'var(--mono)', fontSize:'13px', fontWeight:700, color:'var(--accent)' }}>{f.final}</td>
                    <td style={{ padding:'13px 20px', borderBottom:'1px solid var(--border)' }}>
                      <div style={{ width:'140px', height:'5px', background:'var(--surface-2)', borderRadius:'3px', overflow:'hidden' }}>
                        <div style={{ width:`${f.pct}%`, height:'100%', background:'var(--accent)', borderRadius:'3px' }} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Info boxes ───────────────────────────────────── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px', maxWidth:'900px', margin:'0 auto', padding:'0 40px 56px' }}>

        <InfoBox title="Como funciona a cobrança cumulativa">
          <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.7, marginBottom:'12px' }}>
            O modelo é idêntico ao usado por AWS, GCP e Azure. Cada faixa é cobrada integralmente antes de avançar para a próxima. Faixas anteriores nunca são recalculadas com desconto retroativo.
          </p>
          <div style={{ background:'var(--surface-2)', border:'1px solid var(--border)', borderRadius:'8px', padding:'14px', fontFamily:'var(--mono)', fontSize:'12px', color:'var(--text-muted)', lineHeight:2 }}>
            <span style={{ display:'block', marginBottom:'4px', color:'var(--text-dim)' }}>Exemplo: 600 consultas no período</span>
            <span style={{ color:'var(--accent)', fontWeight:700 }}>500 × R$ 0,22</span> = R$ 110,00<br />
            <span style={{ color:'var(--accent)', fontWeight:700 }}>100 × R$ 0,18</span> = R$  18,00<br />
            <span style={{ display:'block', borderTop:'1px solid var(--border)', paddingTop:'6px', marginTop:'4px' }}>
              Total: <span style={{ color:'var(--accent)', fontWeight:700 }}>R$ 128,00</span>
            </span>
          </div>
        </InfoBox>

        <InfoBox title="Adicional fixo de R$ 0,03">
          <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.7, marginBottom:'12px' }}>
            Aplicado em todas as faixas, em cada consulta. Cobre custos de infraestrutura, certificado digital A1 ICP-Brasil e manutenção da integração oficial SEFAZ.
          </p>
          <ul style={{ paddingLeft:'16px', fontSize:'13px', color:'var(--text-muted)', lineHeight:2 }}>
            <li>Cobrado a cada consulta <strong style={{ color:'var(--text)' }}>solicitada</strong></li>
            <li>Independente do resultado da SEFAZ</li>
            <li>Independente de erro ou timeout</li>
            <li>Já incluso nos preços finais da tabela acima</li>
          </ul>
        </InfoBox>

        <InfoBox title="Saldo pré-pago">
          <ul style={{ paddingLeft:'16px', fontSize:'13px', color:'var(--text-muted)', lineHeight:2.1 }}>
            <li>Compra via <strong style={{ color:'var(--text)' }}>PIX</strong> (confirmação imediata) ou <strong style={{ color:'var(--text)' }}>Boleto</strong> (1–3 dias úteis)</li>
            <li>Saldo válido por <strong style={{ color:'var(--text)' }}>30 dias</strong> após confirmação</li>
            <li>Saldo não utilizado é <strong style={{ color:'var(--danger)' }}>zerado</strong> ao expirar</li>
            <li>Valor mínimo de compra: <strong style={{ color:'var(--accent)' }}>R$ 50,00</strong></li>
            <li>Sem contratos ou mensalidades</li>
            <li>Múltiplas recargas com saldos independentes</li>
          </ul>
        </InfoBox>

        <InfoBox title="Cache e deduplicação inteligente">
          <p style={{ fontSize:'13px', color:'var(--text-muted)', lineHeight:1.7, marginBottom:'12px' }}>
            Consultas realizadas ficam em cache por 7 dias no Redis. Protege sua equipe contra consultas acidentais duplicadas.
          </p>
          <ul style={{ paddingLeft:'16px', fontSize:'13px', color:'var(--text-muted)', lineHeight:2 }}>
            <li>Mesma NF consultada novamente: <strong style={{ color:'var(--accent)' }}>sem débito de saldo</strong></li>
            <li>Resultado entregue em milissegundos via cache</li>
            <li>Cache só é invalidado se a NF mudar de status</li>
            <li>TTL configurável por contrato</li>
          </ul>
        </InfoBox>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div style={{ background:'linear-gradient(135deg,#0e1a14,#0a1410)', borderTop:'1px solid var(--border)', padding:'56px 40px', textAlign:'center' }}>
        <h2 style={{ fontSize:'26px', fontWeight:700, marginBottom:'12px' }}>Calcule o custo para o seu volume</h2>
        <p style={{ color:'var(--text-muted)', fontSize:'14px', marginBottom:'28px' }}>
          Use o simulador no painel do gestor para projetar gastos com base no seu histórico.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{ padding:'13px 32px', background:'var(--accent)', color:'#000', border:'none', borderRadius:'9px', fontSize:'15px', fontWeight:700, cursor:'pointer', fontFamily:'var(--sans)' }}
        >
          Criar conta e acessar simulador
        </button>
      </div>

      <footer style={{ borderTop:'1px solid var(--border)', padding:'28px 40px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'9px', cursor:'pointer' }} onClick={() => navigate('/')}>
          <div style={{ width:'26px', height:'26px', background:'var(--accent)', borderRadius:'6px', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--mono)', fontSize:'10px', fontWeight:700, color:'#000' }}>VN</div>
          <span style={{ fontSize:'13px', fontWeight:700 }}>validaeNota</span>
        </div>
        <span style={{ fontSize:'12px', color:'var(--text-dim)' }}>© 2025 validaeNota.</span>
      </footer>
    </div>
  )
}

function NavBtn({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding:'7px 16px', borderRadius:'8px', cursor:'pointer', fontSize:'14px', fontWeight:500, color: active ? 'var(--text)' : 'var(--text-muted)', background: active ? 'var(--surface-2)' : 'transparent', border:'none', fontFamily:'var(--sans)' }}
    >
      {label}
    </button>
  )
}

function InfoBox({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'12px', padding:'22px' }}>
      <h3 style={{ fontSize:'14px', fontWeight:700, marginBottom:'14px', display:'flex', alignItems:'center', gap:'8px' }}>
        <span style={{ width:'8px', height:'8px', borderRadius:'2px', background:'var(--accent)', flexShrink:0, display:'inline-block' }} />
        {title}
      </h3>
      {children}
    </div>
  )
}
