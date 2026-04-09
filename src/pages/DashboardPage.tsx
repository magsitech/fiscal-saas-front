import { useEffect, useState } from 'react'
import { formatDistanceToNow, parseISO } from 'date-fns'
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
  { label: '1-500', preco: 0.22, pct: 100 },
  { label: '501-2.000', preco: 0.18, pct: 82 },
  { label: '2.001-5.000', preco: 0.16, pct: 73 },
  { label: '5.001-10.000', preco: 0.15, pct: 68 },
  { label: '10.001-30.000', preco: 0.13, pct: 59 },
  { label: '30.001-50.000', preco: 0.12, pct: 55 },
  { label: '50.001+', preco: 0.11, pct: 50 },
]

function fmt(val: string | number) {
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

function SummaryValueCard({
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
    <Card className={`app-kpi-card ${featured ? 'app-kpi-card-featured' : ''}`}>
      <div className={featured ? 'p-7' : 'p-6'}>
        <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-dim)] mb-4">
          {label}
        </div>
        <div
          className={featured ? 'font-mono text-[36px] font-semibold leading-none mb-4' : 'font-mono text-[30px] font-semibold leading-none mb-4'}
          style={{ color: tone }}
        >
          {value}
        </div>
        <div
          className="rounded-[18px] border px-4 py-3 text-sm leading-relaxed text-[var(--text-muted)]"
          style={{ borderColor: 'var(--border)', background: 'color-mix(in srgb, var(--surface-2) 86%, transparent)' }}
        >
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

  const valorInicial = Math.max(parseFloat(saldo?.saldo_disponivel ?? '0'), 1)
  const disponivel = parseFloat(saldo?.saldo_disponivel ?? '0')
  const usado = Math.max(valorInicial - disponivel, 0)
  const pct = Math.min(Math.round((usado / valorInicial) * 100), 100)

  const diasRestantes = saldo?.expira_em
    ? Math.ceil((new Date(saldo.expira_em).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <div className="space-y-10">
      <section
        className="dashboard-summary-hero rounded-[24px] border relative overflow-hidden"
        style={{ boxShadow: 'var(--shadow)' }}
      >
        <div
          className="absolute -top-12 -right-12 w-56 h-56 rounded-full"
          style={{ background: 'var(--dashboard-hero-orb)' }}
        />
        <div
          className="absolute bottom-0 left-0 right-0 h-px"
          style={{ background: 'var(--dashboard-hero-line)' }}
        />

        <div className="p-9 space-y-9 relative z-10">
          <div className="flex items-start justify-between gap-6 dashboard-hero-top">
            <div className="space-y-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] dashboard-summary-kicker">
                Resumo financeiro
              </div>
              {loading ? (
                <Skeleton className="w-52 h-11" />
              ) : (
                <div className="font-mono text-[44px] font-semibold leading-none dashboard-summary-value">
                  <span className="text-xl dashboard-summary-currency mr-2">R$</span>
                  {fmt(saldo?.saldo_disponivel ?? '0')}
                </div>
              )}
              <p className="text-[15px] dashboard-summary-copy max-w-[46ch] leading-8">
                Acompanhe o saldo disponível, o consumo do período e a proximidade de expiração dos créditos.
              </p>
            </div>

            <div
              className="dashboard-summary-panel rounded-[22px] border p-6 min-w-[320px]"
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] dashboard-summary-panel-label mb-4">
                Situação atual
              </div>
              <div className="text-base font-semibold dashboard-summary-panel-value mb-3">
                {resumo?.saldo_status ?? 'Sem saldo'}
              </div>
              <div className="text-sm dashboard-summary-panel-copy leading-7">
                {resumo?.saldo_expira_em
                  ? `Créditos válidos até ${new Date(resumo.saldo_expira_em).toLocaleDateString('pt-BR')}`
                  : 'Sem expiração ativa no momento.'}
              </div>
              <div className="grid grid-cols-2 gap-5 mt-6">
                <div className="dashboard-summary-stat rounded-2xl border p-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] dashboard-summary-stat-label mb-2">Consultas</div>
                  <div className="font-mono text-base font-semibold dashboard-summary-stat-value">{(saldo?.consultas_no_periodo ?? 0).toLocaleString('pt-BR')}</div>
                </div>
                <div className="dashboard-summary-stat rounded-2xl border p-5">
                  <div className="text-[10px] uppercase tracking-[0.14em] dashboard-summary-stat-label mb-2">Expiração</div>
                  <div className="font-mono text-base font-semibold dashboard-summary-stat-value">
                    {diasRestantes !== null ? `${diasRestantes} dias` : '-'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="h-2 rounded-full dashboard-summary-track overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{
                  width: `${pct}%`,
                  background: 'var(--dashboard-hero-progress)',
                }}
              />
            </div>
            <div className="flex justify-between mt-4 text-sm dashboard-summary-meta dashboard-hero-meta" style={{ gap: '18px' }}>
              <span>{pct}% do saldo atual comprometido</span>
              <span>{(saldo?.consultas_no_periodo ?? 0).toLocaleString('pt-BR')} consultas no período</span>
            </div>
          </div>
        </div>
      </section>

      <div
        className="grid grid-cols-4 gap-4 dashboard-kpis"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}
      >
        {[
          {
            label: 'Consultas hoje',
            value: resumo?.consultas_hoje ?? '-',
            sub: `R$ ${fmt(resumo?.gasto_hoje ?? '0')} consumidos hoje`,
            color: 'var(--accent)',
            featured: true,
          },
          {
            label: 'Consultas no período',
            value: (resumo?.consultas_periodo ?? 0).toLocaleString('pt-BR'),
            sub: `R$ ${fmt(resumo?.gasto_periodo ?? '0')} debitados no período`,
            color: 'var(--info)',
            featured: true,
          },
          {
            label: 'Saldo utilizado',
            value: `R$ ${fmt(usado)}`,
            sub: `de R$ ${fmt(valorInicial)} monitorados`,
            color: 'var(--warn)',
            featured: false,
          },
          {
            label: 'Status do saldo',
            value: saldo?.status ?? '-',
            sub: diasRestantes !== null ? `${diasRestantes} dias restantes` : 'Sem saldo ativo',
            color: saldo?.status === 'ATIVO' ? 'var(--accent)' : 'var(--danger)',
            featured: false,
          },
        ].map((k) =>
          loading ? (
            <Card key={k.label} className="app-kpi-card">
              <div className="p-6">
                <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--text-dim)] mb-4">
                  {k.label}
                </div>
                <Skeleton className="w-24 h-7 mb-4" />
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ) : (
            <SummaryValueCard
              key={k.label}
              label={k.label}
              value={k.value}
              note={k.sub}
              tone={k.color}
              featured={k.featured}
            />
          )
        )}
      </div>

      <div
        className="grid grid-cols-2 gap-4 dashboard-bottom-grid"
        style={{ display: 'grid', gridTemplateColumns: '1.08fr 1.4fr', gap: '28px' }}
      >
        <Card className="app-dashboard-panel">
          <CardHeader>
            <CardTitle>Tabela de preços por faixa</CardTitle>
            <span className="text-xs text-[var(--text-muted)]">Base de cálculo do simulador</span>
          </CardHeader>
          <div className="p-7 space-y-6">
            {FAIXAS.map((f) => (
              <div key={f.label} className="space-y-2.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[11px] text-[var(--text-dim)]">{f.label}</span>
                  <span className="font-mono text-xs font-semibold text-[var(--text)]">R$ {f.preco.toFixed(2)}</span>
                </div>
                <div className="h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${f.pct}%`, opacity: 0.55 + f.pct / 220 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="app-dashboard-panel">
          <CardHeader>
            <div className="space-y-2">
              <CardTitle>Últimas auditorias</CardTitle>
              <div className="text-xs text-[var(--text-muted)] leading-6">Acompanhe as consultas fiscais mais recentes</div>
            </div>
            <Button
              type="button"
              variant="soft"
              size="sm"
              icon={<ArrowRight size={13} />}
              onClick={() => navigate('/app/auditoria')}
            >
              Ver todas
            </Button>
          </CardHeader>

          <div className="app-data-desktop app-table-shell">
            <Table>
              <thead>
                <tr>
                  <Th>Chave NF</Th>
                  <Th>Modelo</Th>
                  <Th>Status</Th>
                  <Th>Quando</Th>
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
                        <span className={`text-xs font-mono font-semibold ${v.modelo === '55' ? 'text-[var(--info)]' : 'text-[var(--accent)]'}`}>
                          NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </Td>
                      <Td><Badge status={v.status} /></Td>
                      <Td>
                        <span className="text-xs">
                          {formatDistanceToNow(parseISO(v.criado_em), { addSuffix: true, locale: ptBR })}
                        </span>
                      </Td>
                    </TrHover>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          <div className="app-data-mobile p-4">
            <div className="app-mobile-card-list">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <div className="p-4 space-y-3">
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
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">
                            Chave NF
                          </div>
                          <ChaveNF chave={v.chave_nf} />
                        </div>
                        <Badge status={v.status} />
                      </div>
                      <div className="flex items-center justify-between gap-3 py-2 border-t border-[var(--border)]">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">Modelo</span>
                        <span className={`text-xs font-mono font-semibold ${v.modelo === '55' ? 'text-[var(--info)]' : 'text-[var(--accent)]'}`}>
                          NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">Quando</span>
                        <span className="text-xs text-[var(--text-muted)]">
                          {formatDistanceToNow(parseISO(v.criado_em), { addSuffix: true, locale: ptBR })}
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
