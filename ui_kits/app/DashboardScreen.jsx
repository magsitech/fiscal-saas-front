// DashboardScreen — validaENota app dashboard (staging branch)

const FAIXAS_DASH = [
  { label: '1–500', preco: 0.22, pct: 100 },
  { label: '501–2.000', preco: 0.18, pct: 82 },
  { label: '2.001–5.000', preco: 0.16, pct: 73 },
  { label: '5.001–10.000', preco: 0.15, pct: 68 },
  { label: '10.001–30.000', preco: 0.13, pct: 59 },
  { label: '30.001–50.000', preco: 0.12, pct: 55 },
  { label: '50.001+', preco: 0.11, pct: 50 },
]

const AUDITORIAS = [
  { chave: '35250412345678901234567890123456789012345', modelo: '55', status: 'AUTORIZADA', data: '24/04/2026' },
  { chave: '35250498765432109876543210987654321098765', modelo: '65', status: 'AUTORIZADA', data: '24/04/2026' },
  { chave: '35250411111111111111111111111111111111111', modelo: '55', status: 'CANCELADA', data: '23/04/2026' },
  { chave: '35250499999999999999999999999999999999999', modelo: '55', status: 'PROCESSANDO', data: '23/04/2026' },
  { chave: '35250488888888888888888888888888888888888', modelo: '65', status: 'PENDENTE', data: '22/04/2026' },
]

const STATUS_COLORS = {
  AUTORIZADA: { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  CANCELADA:  { bg: 'var(--danger-dim)', color: 'var(--danger)' },
  PROCESSANDO:{ bg: 'var(--info-dim)',   color: 'var(--info)' },
  PENDENTE:   { bg: 'var(--warn-dim)',   color: 'var(--warn)' },
  DENEGADA:   { bg: 'var(--danger-dim)', color: 'var(--danger)' },
}

function StatusBadge({ status }) {
  const { bg, color } = STATUS_COLORS[status] ?? { bg: 'var(--surface-2)', color: 'var(--text-muted)' }
  const labels = { AUTORIZADA: 'Autorizada', CANCELADA: 'Cancelada', PROCESSANDO: 'Processando', PENDENTE: 'Pendente', DENEGADA: 'Denegada' }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, background: bg, color }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
      {labels[status] ?? status}
    </span>
  )
}

function KpiCard({ label, value, note, tone, featured }) {
  return (
    <div style={{ background: 'var(--surface)', border: featured ? `1px solid color-mix(in srgb, var(--accent) 22%, var(--border))` : '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: featured ? `0 18px 38px color-mix(in srgb, var(--accent) 10%, transparent)` : '0 10px 30px rgba(0,0,0,0.2)', position: 'relative' }}>
      {featured && <div style={{ position: 'absolute', inset: '0 auto 0 0', width: '4px', background: 'linear-gradient(180deg, var(--accent), color-mix(in srgb, #3b82f6 70%, var(--accent)))' }} />}
      <div style={{ position: 'absolute', inset: 'auto -20px -30px auto', width: '120px', height: '120px', borderRadius: '999px', background: 'radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ padding: featured ? '28px 28px 28px 32px' : '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-dim)' }}>{label}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: featured ? '34px' : '28px', fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em', color: tone }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6, paddingTop: '4px', borderTop: '1px solid var(--border)' }}>{note}</div>
      </div>
    </div>
  )
}

function DashboardScreen({ navigate }) {
  const pct = 21

  return (
    <AppShell screen="dashboard" navigate={navigate} title="Dashboard" subtitle="Visão geral do consumo e saldo disponível" badge="Principal">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

        {/* Hero financeiro */}
        <section style={{ borderRadius: '24px', border: '1px solid rgba(0,212,170,0.18)', background: 'linear-gradient(135deg, #0f1915 0%, #0b1110 60%, #101b17 100%)', position: 'relative', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <div style={{ position: 'absolute', top: '-56px', right: '-56px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.18), transparent 68%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px', background: 'linear-gradient(90deg, transparent, rgba(0,212,170,0.45), transparent)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px' }}>
              {/* Left */}
              <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'var(--accent)' }}>Resumo financeiro</div>
                <div style={{ fontFamily: 'var(--font-mono)', lineHeight: 1, letterSpacing: '-0.03em', color: '#f4fffb' }}>
                  <span style={{ fontSize: '20px', marginRight: '6px', opacity: 0.65, color: 'rgba(226,244,239,0.72)' }}>R$</span>
                  <span style={{ fontSize: '52px', fontWeight: 600 }}>157,70</span>
                </div>
                <p style={{ fontSize: '14px', lineHeight: 1.75, maxWidth: '46ch', color: 'rgba(226,244,239,0.76)', margin: 0 }}>
                  Acompanhe o saldo disponível, o consumo do período e a proximidade de expiração dos créditos.
                </p>
              </div>
              {/* Right panel */}
              <div style={{ borderRadius: '20px', border: '1px solid rgba(0,212,170,0.14)', background: 'rgba(10,16,15,0.55)', padding: '24px', minWidth: '268px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', marginBottom: '10px', color: 'rgba(226,244,239,0.62)' }}>Situação atual</div>
                <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px', color: '#f4fffb' }}>Créditos ativos</div>
                <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px', color: 'rgba(226,244,239,0.76)' }}>Créditos válidos até 17/05/2026</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {[['Consultas', '1.847'], ['Expiração', '23 dias']].map(([lbl, val]) => (
                    <div key={lbl} style={{ borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '14px 16px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: '6px', color: 'rgba(226,244,239,0.62)' }}>{lbl}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', fontWeight: 600, color: '#f4fffb' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div style={{ height: '6px', borderRadius: '999px', overflow: 'hidden', background: 'rgba(255,255,255,0.08)' }}>
                <div style={{ height: '100%', borderRadius: '999px', width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), #5eead4)', transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', fontSize: '12px', color: 'rgba(226,244,239,0.76)' }}>
                <span>{pct}% do saldo comprometido</span>
                <span>1.847 consultas no período</span>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }} className="dashboard-kpis">
          <KpiCard label="Consultas hoje" value="247" note="R$ 0,22 consumidos hoje" tone="var(--accent)" featured={true} />
          <KpiCard label="Consultas no período" value="1.847" note="R$ 42,30 debitados no período. Próxima: R$ 0,22." tone="var(--info)" featured={true} />
          <KpiCard label="Saldo utilizado" value="R$ 42,30" note="de R$ 200,00 no período" tone="var(--warn)" featured={false} />
          <KpiCard label="Status do saldo" value="ATIVO" note="23 dias restantes" tone="var(--accent)" featured={false} />
        </div>

        {/* Bottom grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '28px' }} className="dashboard-bottom-grid">
          {/* Faixas */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Tabela de preços por faixa</span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Base do simulador</span>
            </div>
            <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {FAIXAS_DASH.map(f => (
                <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{f.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 600 }}>R$ {f.preco.toFixed(2)}</span>
                  </div>
                  <div style={{ height: '5px', borderRadius: '999px', background: 'var(--surface-2)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '999px', width: `${f.pct}%`, background: 'var(--accent)', opacity: 0.4 + f.pct / 180 }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Últimas auditorias */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 16px 40px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 20px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, letterSpacing: '-0.02em' }}>Últimas auditorias</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Consultas fiscais mais recentes</div>
              </div>
              <button onClick={() => navigate('auditoria')} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '999px', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', color: 'var(--accent)', fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                Ver todas →
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr>
                    {['Chave NF-e', 'Modelo', 'Status', 'Data'].map((h, i) => (
                      <th key={h} style={{ textAlign: i === 3 ? 'right' : 'left', padding: '10px 16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {AUDITORIAS.map((v, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                          {v.chave.slice(0, 10)}…{v.chave.slice(-4)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, padding: '3px 7px', borderRadius: '6px', background: v.modelo === '55' ? 'var(--info-dim)' : 'var(--accent-dim)', color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)' }}>
                          NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}><StatusBadge status={v.status} /></td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{v.data}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

Object.assign(window, { DashboardScreen })
