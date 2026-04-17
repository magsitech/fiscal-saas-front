import { useEffect, useState } from 'react'
import { differenceInCalendarDays, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { dashboardApi, saldoApi } from '@/services/api'
import type { AuditoriaItem, DashboardResumo, SaldoResumo } from '@/types'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  ChaveNF,
  Empty,
  Skeleton,
  Table,
  Td,
  Th,
  TrHover,
} from '@/components/ui'

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
  featured = false,
}: {
  label: string
  value: React.ReactNode
  note: React.ReactNode
  tone: string
  featured?: boolean
}) {
  return (
    <Card className={`app-kpi-card${featured ? ' app-kpi-card-featured' : ''}`}>
      <div style={{ padding: featured ? '28px' : '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
          fontSize: featured ? '34px' : '28px',
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
  const [ultimas, setUltimas] = useState<AuditoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      dashboardApi.resumo().catch(() => null),
      saldoApi.resumo().catch(() => null),
      dashboardApi.auditoria({ limit: 6 }).catch(() => []),
    ]).then(([r, s, v]) => {
      setResumo(r)
      setSaldo(s)
      setUltimas(v)
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
      featured: true,
    },
    {
      label: 'Consultas no período',
      value: loading ? null : (resumo?.consultas_periodo ?? 0).toLocaleString('pt-BR'),
      note: resumo?.prox_consulta_custo
        ? `R$ ${fmt(resumo?.gasto_periodo ?? '0')} debitados no período. Próxima consulta: R$ ${fmt(resumo.prox_consulta_custo)}.`
        : `R$ ${fmt(resumo?.gasto_periodo ?? '0')} debitados no período`,
      tone: 'var(--info)',
      featured: true,
    },
    {
      label: 'Saldo utilizado',
      value: loading ? null : `R$ ${fmt(usado)}`,
      note: `de R$ ${fmt(totalPeriodo)} no período`,
      tone: 'var(--warn)',
      featured: false,
    },
    {
      label: 'Status do saldo',
      value: loading ? null : (saldo?.status ?? '-'),
      note: diasRestantes !== null ? `${diasRestantes} dias restantes` : 'Sem saldo ativo',
      tone: saldo?.status === 'ATIVO' ? 'var(--accent)' : 'var(--danger)',
      featured: false,
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
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '6px' }} className="dashboard-summary-panel-value">
                {resumo?.saldo_status ?? 'Sem saldo'}
              </div>
              <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '20px' }} className="dashboard-summary-panel-copy">
                {resumo?.saldo_expira_em
                  ? `Créditos válidos até ${new Date(resumo.saldo_expira_em).toLocaleDateString('pt-BR')}`
                  : 'Sem expiração ativa no momento.'}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="dashboard-summary-stat" style={{ borderRadius: '14px', border: '1px solid', padding: '14px 16px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: '6px' }} className="dashboard-summary-stat-label">
                    Consultas
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600 }} className="dashboard-summary-stat-value">
                    {(resumo?.consultas_periodo ?? saldo?.consultas_no_periodo ?? 0).toLocaleString('pt-BR')}
                  </div>
                </div>
                <div className="dashboard-summary-stat" style={{ borderRadius: '14px', border: '1px solid', padding: '14px 16px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.13em', marginBottom: '6px' }} className="dashboard-summary-stat-label">
                    Expiração
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600 }} className="dashboard-summary-stat-value">
                    {diasRestantes !== null ? `${diasRestantes} dias` : '-'}
                  </div>
                </div>
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
              featured={k.featured}
            />
          )
        )}
      </div>

      {/* ── Faixas + Últimas auditorias ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '28px' }} className="dashboard-bottom-grid">

        {/* Tabela de faixas */}
        <Card className="app-dashboard-panel">
          <CardHeader>
            <CardTitle>Tabela de preços por faixa</CardTitle>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Base de cálculo do simulador</span>
          </CardHeader>
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {FAIXAS.map((f) => (
              <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{f.label}</span>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>
                    R$ {f.preco.toFixed(2)}
                  </span>
                </div>
                <div style={{ height: '5px', borderRadius: '999px', background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: '999px',
                    width: `${f.pct}%`,
                    background: 'var(--accent)',
                    opacity: 0.4 + f.pct / 180,
                  }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Últimas auditorias */}
        <Card className="app-dashboard-panel">
          <CardHeader>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <CardTitle>Últimas auditorias</CardTitle>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Consultas fiscais mais recentes</div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/app/auditoria')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '999px',
                border: '1px solid var(--accent-glow)',
                background: 'var(--accent-dim)',
                color: 'var(--accent)',
                fontFamily: 'var(--sans)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.01em',
                transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-dim)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--accent-glow)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Ver todas
              <ArrowRight size={13} />
            </button>
          </CardHeader>

          <div className="app-data-desktop app-table-shell">
            <Table>
              <thead>
                <tr>
                  <Th>Chave NF</Th>
                  <Th>Modelo</Th>
                  <Th>Status</Th>
                  <Th>Data</Th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TrHover key={i}>
                      <Td><Skeleton className="h-4 w-28" /></Td>
                      <Td><Skeleton className="h-4 w-10" /></Td>
                      <Td><Skeleton className="h-4 w-20" /></Td>
                      <Td><Skeleton className="h-4 w-16" /></Td>
                    </TrHover>
                  ))
                ) : ultimas.length === 0 ? (
                  <tr><td colSpan={4}><Empty message="Nenhuma auditoria ainda" /></td></tr>
                ) : (
                  ultimas.map((v) => (
                    <TrHover key={v.id}>
                      <Td><ChaveNF chave={v.chave_nf} /></Td>
                      <Td>
                        <span style={{
                          fontSize: '11px', fontFamily: 'var(--mono)', fontWeight: 600,
                          color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)',
                        }}>
                          NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </Td>
                      <Td><Badge status={v.status} /></Td>
                      <Td>
                        <span style={{ fontSize: '12px', fontFamily: 'var(--mono)', color: 'var(--text-muted)' }}>
                          {format(parseISO(v.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </Td>
                    </TrHover>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="app-data-mobile" style={{ padding: '16px' }}>
            <div style={{ display: 'grid', gap: '10px' }}>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/5" />
                    </div>
                  </Card>
                ))
              ) : ultimas.length === 0 ? (
                <Empty message="Nenhuma auditoria ainda" />
              ) : (
                ultimas.map((v) => (
                  <Card key={v.id}>
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '4px' }}>
                            Chave NF
                          </div>
                          <ChaveNF chave={v.chave_nf} />
                        </div>
                        <Badge status={v.status} />
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Modelo</span>
                        <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', fontWeight: 600, color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)' }}>
                          NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Data</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {format(parseISO(v.criado_em), 'dd/MM/yyyy', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
