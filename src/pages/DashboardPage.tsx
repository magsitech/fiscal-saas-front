import { useEffect, useState } from 'react'
import { dashboardApi, saldoApi } from '@/services/api'
import type { DashboardResumo, SaldoResumo, ValidacaoItem } from '@/types'
import { Card, CardHeader, CardTitle, Badge, ChaveNF, Skeleton, Table, Th, Td, TrHover, Empty } from '@/components/ui'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'

const FAIXAS = [
  { label: '1 – 500',          preco: 0.22, pct: 100 },
  { label: '501 – 2.000',      preco: 0.18, pct: 82  },
  { label: '2.001 – 5.000',    preco: 0.16, pct: 73  },
  { label: '5.001 – 10.000',   preco: 0.15, pct: 68  },
  { label: '10.001 – 30.000',  preco: 0.13, pct: 59  },
  { label: '30.001 – 50.000',  preco: 0.12, pct: 55  },
  { label: '50.001 – 80.000',  preco: 0.11, pct: 50  },
]

function fmt(val: string | number) {
  return Number(val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })
}

export function DashboardPage() {
  const [resumo, setResumo] = useState<DashboardResumo | null>(null)
  const [saldo, setSaldo] = useState<SaldoResumo | null>(null)
  const [ultimas, setUltimas] = useState<ValidacaoItem[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      dashboardApi.resumo().catch(() => null),
      saldoApi.resumo().catch(() => null),
      dashboardApi.validacoes({ limit: 6 }).catch(() => []),
    ]).then(([r, s, v]) => {
      setResumo(r)
      setSaldo(s)
      setUltimas(v)
      setLoading(false)
    })
  }, [])

  const valorInicial = parseFloat(saldo?.valor_inicial ?? saldo?.saldo_disponivel ?? '1')
  const disponivel = parseFloat(saldo?.saldo_disponivel ?? '0')
  const usado = valorInicial - disponivel
  const pct = Math.min(Math.round((usado / valorInicial) * 100), 100)

  const diasRestantes = saldo?.expira_em
    ? Math.ceil((new Date(saldo.expira_em).getTime() - Date.now()) / 86_400_000)
    : null

  return (
    <div className="space-y-6">

      {/* ── Saldo Card ─────────────────────────────────────── */}
      <div className="rounded-xl p-7 relative overflow-hidden border border-[rgba(0,212,170,0.2)]"
        style={{ background: 'linear-gradient(135deg, #0e1a14, #0a1410)' }}>
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(0,212,170,0.12) 0%, transparent 70%)' }} />

        <div className="flex items-start justify-between mb-6 relative z-10">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              Saldo Disponível
            </div>
            {loading ? (
              <Skeleton className="w-48 h-10 mb-2" />
            ) : (
              <div className="font-mono text-4xl font-semibold leading-none">
                <span className="text-xl text-[var(--text-muted)] mr-1">R$</span>
                {fmt(saldo?.saldo_disponivel ?? '0')}
              </div>
            )}
            {diasRestantes !== null && (
              <div className="text-xs text-[var(--text-muted)] mt-2">
                Expira em{' '}
                <span className={`font-semibold ${diasRestantes <= 7 ? 'text-[var(--warn)]' : 'text-[var(--text)]'}`}>
                  {diasRestantes} dia{diasRestantes !== 1 ? 's' : ''}
                </span>
                {saldo?.expira_em && (
                  <span className="ml-1">
                    ({new Date(saldo.expira_em).toLocaleDateString('pt-BR')})
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="text-right relative z-10">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--accent)] mb-2">
              Próxima consulta
            </div>
            <div className="text-lg font-mono font-semibold text-[var(--text)]">
              {resumo?.prox_faixa ?? '—'}
            </div>
            <div className="text-2xl font-mono font-semibold text-[var(--accent)] mt-1">
              R$ {resumo?.prox_consulta_custo ?? '—'}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="h-1.5 rounded-full bg-[var(--surface-2)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000"
              style={{
                width: `${pct}%`,
                background: 'linear-gradient(90deg, var(--accent), #00ffcc)',
              }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
            <span>{pct}% do saldo inicial utilizado</span>
            <span>{(saldo?.consultas_no_periodo ?? 0).toLocaleString('pt-BR')} consultas no período</span>
          </div>
        </div>
      </div>

      {/* ── KPIs ───────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: 'Consultas Hoje',
            value: resumo?.consultas_hoje ?? '—',
            sub: `R$ ${fmt(resumo?.gasto_hoje ?? '0')} gasto hoje`,
            color: 'var(--accent)',
          },
          {
            label: 'Consultas no Período',
            value: (resumo?.consultas_periodo ?? 0).toLocaleString('pt-BR'),
            sub: `R$ ${fmt(resumo?.gasto_periodo ?? '0')} total gasto`,
            color: 'var(--info)',
          },
          {
            label: 'Saldo Utilizado',
            value: `R$ ${fmt(usado)}`,
            sub: `de R$ ${fmt(valorInicial)} inicial`,
            color: 'var(--warn)',
          },
          {
            label: 'Status do Saldo',
            value: saldo?.status ?? '—',
            sub: diasRestantes !== null ? `${diasRestantes} dias restantes` : 'sem saldo ativo',
            color: saldo?.status === 'ATIVO' ? 'var(--accent)' : 'var(--danger)',
          },
        ].map((k) => (
          <Card key={k.label} className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: k.color }} />
            <div className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2.5">{k.label}</div>
              {loading
                ? <Skeleton className="w-24 h-7 mb-2" />
                : <div className="font-mono text-xl font-semibold leading-none mb-1.5" style={{ color: k.color }}>{k.value}</div>
              }
              <div className="text-xs text-[var(--text-muted)]">{k.sub}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Bottom grid ────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Tabela de faixas */}
        <Card>
          <CardHeader>
            <CardTitle>Tabela de Preços por Faixa</CardTitle>
            <span className="text-xs text-[var(--text-muted)]">+ R$ 0,03 fixo incluso</span>
          </CardHeader>
          <div className="p-5 space-y-3">
            {FAIXAS.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="font-mono text-[11px] text-[var(--text-dim)] w-28 shrink-0">{f.label}</span>
                <div className="flex-1 h-1 rounded-full bg-[var(--surface-2)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--accent)]"
                    style={{ width: `${f.pct}%`, opacity: 0.6 + f.pct / 200 }}
                  />
                </div>
                <span className="font-mono text-xs font-semibold text-[var(--text)] w-14 text-right">
                  R$ {f.preco.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Últimas validações */}
        <Card>
          <CardHeader>
            <CardTitle>Últimas Validações</CardTitle>
            <button
              onClick={() => navigate('/app/validacoes')}
              className="text-xs text-[var(--accent)] hover:underline"
            >
              Ver todas →
            </button>
          </CardHeader>
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
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                  <TrHover key={i}>
                    <Td><Skeleton className="h-4 w-28" /></Td>
                    <Td><Skeleton className="h-4 w-10" /></Td>
                    <Td><Skeleton className="h-4 w-20" /></Td>
                    <Td><Skeleton className="h-4 w-16" /></Td>
                  </TrHover>
                ))
                : ultimas.length === 0
                  ? <tr><td colSpan={4}><Empty message="Nenhuma validação ainda" /></td></tr>
                  : ultimas.map((v) => (
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
              }
            </tbody>
          </Table>
        </Card>
      </div>
    </div>
  )
}
