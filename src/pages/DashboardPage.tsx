import { useEffect, useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { dashboardApi, planosApi, saldoApi } from '@/services/api'
import type { AssinaturaResumo, DashboardResumo, SaldoResumo } from '@/types'
import { Card, Skeleton } from '@/components/ui'

const PLANO_LABEL: Record<string, string> = {
  BASICO: 'Básico', PRO: 'Pro', BUSINESS: 'Business', TRIAL: 'Trial', CANCELADO: 'Cancelado',
}

const FAIXAS = [
  { label: '1–500', preco: 0.22, pct: 100 },
  { label: '501–2.000', preco: 0.18, pct: 82 },
  { label: '2.001–5.000', preco: 0.16, pct: 73 },
  { label: '5.001–10.000', preco: 0.15, pct: 68 },
  { label: '10.001–30.000', preco: 0.13, pct: 59 },
  { label: '30.001–50.000', preco: 0.12, pct: 55 },
  { label: '50.001+', preco: 0.11, pct: 50 },
]

function fmt(val: string | number) {
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function KpiCard({
  label,
  value,
  note,
  tone,
}: {
  label: string
  value: React.ReactNode
  note: React.ReactNode
  tone: string
}) {
  return (
    <Card
      className="app-kpi-card app-kpi-card-featured"
      style={{ '--kpi-strip': tone } as React.CSSProperties}
    >
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--text-dim)',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--mono)',
          fontSize: '28px',
          fontWeight: 600,
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: tone,
        }}>
          {value}
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          paddingTop: '4px',
          borderTop: '1px solid var(--border)',
        }}>
          {note}
        </div>
      </div>
    </Card>
  )
}

export function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [saldo, setSaldo] = useState<SaldoResumo | null>(null)
  const [assinatura, setAssinatura] = useState<AssinaturaResumo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      dashboardApi.resumo().catch(() => null),
      saldoApi.resumo().catch(() => null),
      planosApi.assinatura().catch(() => null),
    ]).then(([r, s, a]) => {
      setResumo(r)
      setSaldo(s)
      setAssinatura(a)
      setLoading(false)
    })
  }, [])

  const disponivel = parseFloat(saldo?.saldo_disponivel ?? '0')
  const gastoPeriodo = parseFloat(resumo?.gasto_periodo ?? '0')
  const totalPeriodo = parseFloat(saldo?.valor_inicial ?? '') || (disponivel + gastoPeriodo)
  const usado = Math.max(gastoPeriodo, 0)
  const pctRaw = totalPeriodo > 0 ? Math.min((usado / totalPeriodo) * 100, 100) : 0
  const pct = usado > 0 && pctRaw < 1 ? 1 : Math.round(pctRaw)

  const diasRestantes = saldo?.expira_em
    ? Math.max(differenceInCalendarDays(parseISO(saldo.expira_em), new Date()), 0)
    : null

  const saldoComprometidoLabel = usado > 0
    ? (pctRaw < 1 ? '<1% do saldo comprometido' : `${pct}% do saldo comprometido`)
    : 'Nenhum saldo comprometido até o momento'

  const kpis = [
    {
      label: 'Consultas hoje',
      value: loading ? null : (resumo?.consultas_hoje ?? '-'),
      note: `R$ ${fmt(resumo?.gasto_hoje ?? '0')} consumidos hoje`,
      tone: 'var(--accent)',
    },
    {
      label: 'Consultas no período',
      value: loading ? null : (resumo?.consultas_periodo ?? 0).toLocaleString('pt-BR'),
      note: resumo?.prox_consulta_custo
        ? `R$ ${fmt(resumo?.gasto_periodo ?? '0')} debitados no período. Próxima consulta: R$ ${fmt(resumo.prox_consulta_custo)}.`
        : `R$ ${fmt(resumo?.gasto_periodo ?? '0')} debitados no período`,
      tone: 'var(--info)',
    },
    {
      label: 'Saldo utilizado',
      value: loading ? null : `R$ ${fmt(usado)}`,
      note: `de R$ ${fmt(totalPeriodo)} no período`,
      tone: 'var(--warn)',
    },
    {
      label: 'Status do saldo',
      value: loading ? null : (saldo?.status ?? '-'),
      note: diasRestantes !== null ? `${diasRestantes} dias restantes` : 'Sem saldo ativo',
      tone: saldo?.status === 'ATIVO' ? 'var(--accent)' : 'var(--danger)',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

      {/* ── Hero financeiro ── */}
      <section
        className="dashboard-summary-hero"
        style={{
          borderRadius: '24px',
          border: '1px solid var(--dashboard-hero-border)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: 'var(--shadow)',
        }}
      >
        <div style={{
          position: 'absolute', top: '-56px', right: '-56px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'var(--dashboard-hero-orb)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '1px',
          background: 'var(--dashboard-hero-line)', pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, padding: '40px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Valor + painel lateral */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '32px' }} className="dashboard-hero-top">

            {/* Esquerda: saldo */}
            <div style={{ flex: '1 1 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.22em',
              }} className="dashboard-summary-kicker">
                Resumo financeiro
              </div>

              {loading ? (
                <Skeleton className="w-52 h-11" />
              ) : (
                <div style={{ fontFamily: 'var(--mono)', lineHeight: 1, letterSpacing: '-0.03em' }} className="dashboard-summary-value">
                  <span style={{ fontSize: '20px', marginRight: '6px', opacity: 0.65 }} className="dashboard-summary-currency">R$</span>
                  <span style={{ fontSize: '52px', fontWeight: 600 }}>{fmt(saldo?.saldo_disponivel ?? '0')}</span>
                </div>
              )}

              <p style={{ fontSize: '14px', lineHeight: 1.75, maxWidth: '46ch' }} className="dashboard-summary-copy">
                Acompanhe o saldo disponível, o consumo do período e a proximidade de expiração dos créditos.
              </p>
            </div>

            {/* Direita: situação */}
            <div className="dashboard-summary-panel" style={{
              borderRadius: '20px',
              border: '1px solid',
              padding: '24px',
              minWidth: '268px',
              flexShrink: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: '0',
            }}>
              <div style={{
                fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                letterSpacing: '0.18em', marginBottom: '10px',
              }} className="dashboard-summary-panel-label">
                Situação atual
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '16px', fontWeight: 600 }} className="dashboard-summary-panel-value">
                  {resumo?.saldo_status ?? 'Sem saldo'}
                </div>
                {assinatura?.plano && (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: 'rgba(0,212,170,0.16)', color: 'var(--accent)', border: '1px solid rgba(0,212,170,0.22)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {PLANO_LABEL[assinatura.plano] ?? assinatura.plano}
                  </span>
                )}
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }} className="dashboard-summary-panel-copy">
                {resumo?.saldo_expira_em
                  ? `Créditos válidos até ${new Date(resumo.saldo_expira_em).toLocaleDateString('pt-BR')}`
                  : 'Sem expiração ativa no momento.'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: assinatura?.plano === 'TRIAL' ? '1fr 1fr' : '1fr', gap: '10px' }}>
                <div className="dashboard-summary-stat" style={{ borderRadius: '14px', border: '1px solid', padding: '14px 16px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: '6px' }} className="dashboard-summary-stat-label">
                    Consultas
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600 }} className="dashboard-summary-stat-value">
                    {(resumo?.consultas_periodo ?? saldo?.consultas_no_periodo ?? 0).toLocaleString('pt-BR')}
                  </div>
                </div>
                {assinatura?.plano === 'TRIAL' && (
                  <div className="dashboard-summary-stat" style={{ borderRadius: '14px', border: '1px solid', padding: '14px 16px' }}>
                    <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: '6px' }} className="dashboard-summary-stat-label">
                      Expiração
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600 }} className="dashboard-summary-stat-value">
                      {diasRestantes !== null ? `${diasRestantes} dias` : '-'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Barra de progresso */}
          <div>
            <div style={{ height: '6px', borderRadius: '999px', overflow: 'hidden' }} className="dashboard-summary-track">
              <div style={{
                height: '100%', borderRadius: '999px',
                width: `${pct}%`,
                background: 'var(--dashboard-hero-progress)',
                transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)',
              }} />
            </div>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginTop: '12px', fontSize: '12px', gap: '16px',
            }} className="dashboard-summary-meta dashboard-hero-meta">
              <span>{saldoComprometidoLabel}</span>
              <span>{(resumo?.consultas_periodo ?? saldo?.consultas_no_periodo ?? 0).toLocaleString('pt-BR')} consultas no período</span>
            </div>
          </div>

          {/* Aviso de mudança de plano agendada */}
          {!loading && assinatura?.proximo_plano && assinatura.ciclo_expira_em && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '12px 16px', borderRadius: '12px',
              background: 'var(--warn-dim, rgba(234,179,8,0.08))',
              border: '1px solid var(--warn-glow, rgba(234,179,8,0.25))',
              fontSize: '13px', color: 'var(--warn, #ca8a04)',
            }}>
              <span style={{ fontSize: '15px' }}>⚠</span>
              <span>
                Seu plano muda para{' '}
                <strong>{PLANO_LABEL[assinatura.proximo_plano] ?? assinatura.proximo_plano}</strong>
                {' '}em{' '}
                <strong>{format(parseISO(assinatura.ciclo_expira_em), 'dd/MM/yyyy', { locale: ptBR })}</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ── KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }} className="dashboard-kpis">
        {kpis.map((k) =>
          loading ? (
            <Card key={k.label} className="app-kpi-card">
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-3 w-full" />
              </div>
            </Card>
          ) : (
            <KpiCard
              key={k.label}
              label={k.label}
              value={k.value}
              note={k.note}
              tone={k.tone}
            />
          )
        )}
      </div>

    </div>
  )
}
