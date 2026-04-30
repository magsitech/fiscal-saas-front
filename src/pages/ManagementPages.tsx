import { useEffect, useMemo, useRef, useState } from 'react'
import { endOfDay, format, parseISO, startOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CheckCircle2, CreditCard, Download, ExternalLink, FileText, Info, Landmark, Lock, RefreshCw, SlidersHorizontal, Sparkles, Webhook, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardApi, faixasApi, pedidosApi, planosApi, webhookApi } from '@/services/api'
import type { AuditoriaItem, AssinaturaResumo, ExtratoItem, FaixaPreco, Pedido, PedidoDetalhe, PlanoCatalogo, WebhookLog } from '@/types'
import { FALLBACK_FAIXAS, FALLBACK_PAID_PLANOS, PAID_PLAN_IDS, sortPlanos } from '@/utils/planos'
import { CreditosCheckout } from '@/components/credits/CreditosCheckout'
import {
  Badge,
  Button,
  Card,
  CardHeader,
  CardTitle,
  ChaveNF,
  Empty,
  Input,
  Select,
  Skeleton,
  Spinner,
  Table,
  Td,
  Th,
  TrHover,
} from '@/components/ui'

type PeriodoFiltro = 'all' | 'today' | '7d' | '30d' | 'custom'

function fmtDate(iso: string | null) {
  if (!iso) return '-'
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

function fmtAgo(iso: string) {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

function toInputDate(value: Date) {
  return format(value, 'yyyy-MM-dd')
}

function buildDateRange(periodo: PeriodoFiltro, inicio: string, fim: string) {
  const now = new Date()

  if (periodo === 'today') {
    return { start: startOfDay(now), end: now }
  }

  if (periodo === '7d') {
    return { start: startOfDay(subDays(now, 6)), end: now }
  }

  if (periodo === '30d') {
    return { start: startOfDay(subDays(now, 29)), end: now }
  }

  if (periodo === 'custom') {
    return {
      start: inicio ? startOfDay(parseISO(`${inicio}T00:00:00`)) : null,
      end: fim ? endOfDay(parseISO(`${fim}T00:00:00`)) : null,
    }
  }

  return { start: null, end: null }
}

function inDateRange(iso: string, periodo: PeriodoFiltro, inicio: string, fim: string) {
  const value = parseISO(iso)
  const { start, end } = buildDateRange(periodo, inicio, fim)
  if (start && value < start) return false
  if (end && value > end) return false
  return true
}

function escapeCsvValue(value: string | number | boolean | null | undefined) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`
}

function exportCsv(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
) {
  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCsvValue).join(';'))
    .join('\n')

  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function MobileField({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-[var(--border)] last:border-b-0">
      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)]">{label}</span>
      <div className="text-right text-sm text-[var(--text-muted)]">{value}</div>
    </div>
  )
}

function MobileSkeletonCards({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </Card>
      ))}
    </>
  )
}

function MetricCard({
  label,
  value,
  note,
  tone = 'var(--accent)',
}: {
  label: string
  value: React.ReactNode
  note?: React.ReactNode
  tone?: string
}) {
  return (
    <div className="app-kpi-card" style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: '20px',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
    }}>
      {/* Accent bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${tone}, color-mix(in srgb, ${tone} 30%, transparent))`,
      }} />
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{
          fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em',
          textTransform: 'uppercase', color: 'var(--text-dim)',
        }}>
          {label}
        </div>
        <div style={{
          fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 700,
          lineHeight: 1, color: tone, letterSpacing: '-0.02em',
        }}>
          {value}
        </div>
        {note && (
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
            {note}
          </div>
        )}
      </div>
    </div>
  )
}

function DateFilters({
  periodo,
  onPeriodoChange,
  inicio,
  onInicioChange,
  fim,
  onFimChange,
}: {
  periodo: PeriodoFiltro
  onPeriodoChange: (value: PeriodoFiltro) => void
  inicio: string
  onInicioChange: (value: string) => void
  fim: string
  onFimChange: (value: string) => void
}) {
  return (
    <>
      <Select label="Período" value={periodo} onChange={(e) => onPeriodoChange(e.target.value as PeriodoFiltro)}>
        <option value="all">Todo o período</option>
        <option value="today">Hoje</option>
        <option value="7d">Últimos 7 dias</option>
        <option value="30d">Últimos 30 dias</option>
        <option value="custom">Intervalo personalizado</option>
      </Select>
      <Input label="De" type="date" value={inicio} onChange={(e) => onInicioChange(e.target.value)} disabled={periodo !== 'custom'} />
      <Input label="Até" type="date" value={fim} onChange={(e) => onFimChange(e.target.value)} disabled={periodo !== 'custom'} />
    </>
  )
}

const ITEMS_PER_PAGE = 25

function paginateItems<T>(items: T[], page: number, pageSize = ITEMS_PER_PAGE) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * pageSize

  return {
    pageItems: items.slice(start, start + pageSize),
    totalPages,
    safePage,
    totalItems: items.length,
  }
}

function matchesPedidoStatusFilter(itemStatus: Pedido['status'], selectedStatus: string) {
  if (!selectedStatus) return true
  if (selectedStatus === 'PENDENTE') {
    return itemStatus === 'PENDENTE' || itemStatus === 'AGUARDANDO_PAGAMENTO'
  }
  return itemStatus === selectedStatus
}

function getAuditoriaCost(item: AuditoriaItem) {
  return item.custo ?? item.custo_consulta ?? null
}

function getExtratoCost(item: ExtratoItem) {
  return item.custo ?? null
}

function getExtratoSaldoAntes(item: ExtratoItem) {
  return item.saldo_antes ?? null
}

function getExtratoSaldoDepois(item: ExtratoItem) {
  return item.saldo_depois ?? item.saldo_resultante ?? null
}

function pedidoPodeContinuar(status: Pedido['status']) {
  return status === 'AGUARDANDO_PAGAMENTO'
}

function Pagination({
  page,
  totalPages,
  totalItems,
  label,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  label: string
  onPageChange: (page: number) => void
}) {
  if (totalItems <= ITEMS_PER_PAGE) return null

  return (
    <div
      className="flex items-center justify-between gap-3 flex-wrap"
      style={{
        padding: '14px 8px 10px',
        marginTop: '12px',
        borderTop: '1px solid var(--border)',
      }}
    >
      <div
        className="text-xs text-[var(--text-muted)]"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 12px',
          borderRadius: '999px',
          background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
          border: '1px solid var(--border)',
        }}
      >
        <span style={{ color: 'var(--text)', fontWeight: 700 }}>{label}</span>
        <span>página {page} de {totalPages}</span>
      </div>
      <div
        className="flex items-center gap-2 flex-wrap"
        style={{
          padding: '6px',
          borderRadius: '999px',
          background: 'color-mix(in srgb, var(--surface-2) 90%, transparent)',
          border: '1px solid var(--border)',
        }}
      >
        <Button
          type="button"
          variant="soft"
          size="sm"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          style={{
            minWidth: '110px',
            borderRadius: '999px',
            boxShadow: '0 10px 24px rgba(15,23,42,0.10)',
          }}
        >
          Anterior
        </Button>
        <span
          className="text-xs font-semibold text-[var(--text-dim)] text-center"
          style={{
            minWidth: '72px',
            padding: '0 10px',
            letterSpacing: '0.04em',
          }}
        >
          {page}/{totalPages}
        </span>
        <Button
          type="button"
          variant="soft"
          size="sm"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{
            minWidth: '110px',
            borderRadius: '999px',
            boxShadow: '0 10px 24px rgba(15,23,42,0.10)',
          }}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}

// ─── Tooltip balloon ─────────────────────────────────────────
function InfoTooltip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <Info size={13} style={{ color: 'var(--text-dim)', cursor: 'default', flexShrink: 0 }} />
      {visible && (
        <span style={{
          position: 'absolute', bottom: 'calc(100% + 8px)', left: '50%',
          transform: 'translateX(-50%)',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '8px 12px',
          fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5,
          whiteSpace: 'nowrap', boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          zIndex: 50, pointerEvents: 'none',
        }}>
          {text}
          <span style={{
            position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent', borderRight: '6px solid transparent',
            borderTop: '6px solid var(--border)',
          }} />
        </span>
      )}
    </span>
  )
}

// ─── Webhook logs (aba interna) ───────────────────────────────
const WEBHOOK_PAGE_SIZE = 50

function WebhookLogsTab({ isBusinessPlan }: { isBusinessPlan: boolean }) {
  const [logs, setLogs] = useState<WebhookLog[]>([])
  const [loading, setLoading] = useState(false)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (!isBusinessPlan || loadedRef.current) return
    loadedRef.current = true
    setLoading(true)
    webhookApi.logs({ limit: WEBHOOK_PAGE_SIZE, offset: 0 })
      .then(data => { setLogs(data); setHasMore(data.length === WEBHOOK_PAGE_SIZE) })
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [isBusinessPlan])

  async function carregarMais() {
    const newOffset = offset + WEBHOOK_PAGE_SIZE
    setLoading(true)
    try {
      const data = await webhookApi.logs({ limit: WEBHOOK_PAGE_SIZE, offset: newOffset })
      setLogs(prev => [...prev, ...data])
      setHasMore(data.length === WEBHOOK_PAGE_SIZE)
      setOffset(newOffset)
    } catch { null } finally { setLoading(false) }
  }

  if (loading && logs.length === 0) {
    return (
      <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-12 w-full" />)}
      </div>
    )
  }

  if (logs.length === 0) {
    return <Empty message="Nenhum log de webhook encontrado." />
  }

  return (
    <>
      <div className="app-data-desktop app-table-shell">
        <Table fixed>
          <colgroup>
            <col style={{ width: '10%' }} />
            <col style={{ width: '32%' }} />
            <col style={{ width: '10%' }} />
            <col style={{ width: '9%' }} />
            <col style={{ width: '20%' }} />
            <col style={{ width: '19%' }} />
          </colgroup>
          <thead>
            <tr>
              <Th>Status</Th>
              <Th>URL</Th>
              <Th><div style={{ textAlign: 'right' }}>Tentativa</div></Th>
              <Th><div style={{ textAlign: 'right' }}>HTTP</div></Th>
              <Th>Auditoria</Th>
              <Th><div style={{ textAlign: 'right' }}>Data</div></Th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <TrHover key={log.id}>
                <Td>
                  {log.sucesso ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
                      <CheckCircle2 size={11} />OK
                    </span>
                  ) : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))' }}>
                      <XCircle size={11} />Falha
                    </span>
                  )}
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                    {log.url}
                  </span>
                </Td>
                <Td><div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '13px' }}>#{log.tentativa}</div></Td>
                <Td>
                  <div style={{ textAlign: 'right' }}>
                    {log.status_http != null ? (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: log.status_http >= 200 && log.status_http < 300 ? 'var(--accent)' : 'var(--danger)' }}>
                        {log.status_http}
                      </span>
                    ) : <span style={{ color: 'var(--text-dim)', fontSize: '13px' }}>—</span>}
                  </div>
                </Td>
                <Td>
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                    {log.log_auditoria_id.slice(0, 8)}…
                  </span>
                </Td>
                <Td>
                  <div style={{ textAlign: 'right', fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {format(parseISO(log.criado_em), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                  </div>
                </Td>
              </TrHover>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="app-data-mobile" style={{ padding: '16px' }}>
        <div className="app-mobile-card-list">
          {logs.map(log => (
            <div key={log.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                {log.sucesso ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'var(--accent-dim)', color: 'var(--accent)', border: '1px solid var(--accent-glow)' }}>
                    <CheckCircle2 size={11} />OK
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '3px 9px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: 'color-mix(in srgb, var(--danger) 10%, transparent)', color: 'var(--danger)', border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))' }}>
                    <XCircle size={11} />Falha
                  </span>
                )}
                {log.status_http != null && (
                  <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600, color: log.status_http >= 200 && log.status_http < 300 ? 'var(--accent)' : 'var(--danger)' }}>
                    HTTP {log.status_http}
                  </span>
                )}
              </div>
              <MobileField label="URL" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '11px', wordBreak: 'break-all' }}>{log.url}</span>} />
              <MobileField label="Tentativa" value={`#${log.tentativa}`} />
              <MobileField label="Auditoria" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '11px' }}>{log.log_auditoria_id.slice(0, 8)}…</span>} />
              <MobileField label="Data" value={format(parseISO(log.criado_em), 'dd/MM/yyyy HH:mm', { locale: ptBR })} />
            </div>
          ))}
        </div>
      </div>

      {hasMore && (
        <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'center' }}>
          <Button variant="ghost" onClick={carregarMais} loading={loading}>
            Carregar mais
          </Button>
        </div>
      )}
    </>
  )
}

export function ValidacoesPage() {
  const [items, setItems] = useState<AuditoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('7d')
  const [inicio, setInicio] = useState(toInputDate(subDays(new Date(), 6)))
  const [fim, setFim] = useState(toInputDate(new Date()))
  const [assinatura, setAssinatura] = useState<AssinaturaResumo | null>(null)
  const [abaAtiva, setAbaAtiva] = useState<'auditoria' | 'webhooks'>('auditoria')
  const isBusinessPlan = assinatura?.plano === 'BUSINESS'

  useEffect(() => {
    planosApi.assinatura().then(setAssinatura).catch(() => null)
  }, [])

  useEffect(() => {
    setLoading(true)
    dashboardApi.auditoria()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(
    () => items.filter((item) => {
      if (status && item.status !== status) return false
      return inDateRange(item.criado_em, periodo, inicio, fim)
    }),
    [items, status, periodo, inicio, fim]
  )
  const autorizadas = filteredItems.filter((item) => item.status === 'AUTORIZADA').length
  const cacheHits = filteredItems.filter((item) => item.cache_hit).length
  const custoTotal = filteredItems.reduce((sum, item) => sum + Number(getAuditoriaCost(item) ?? 0), 0)
  const { pageItems, totalPages, safePage } = paginateItems(filteredItems, page)

  useEffect(() => {
    setPage(1)
  }, [status, periodo, inicio, fim])

  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [page, safePage])

  function handleExport() {
    exportCsv(
      'auditoria.csv',
      ['ID', 'Chave NF-e', 'Modelo', 'CNPJ emitente', 'Status', 'Status SEFAZ', 'Cache', 'Custo', 'Criado em', 'Processado em'],
      filteredItems.map((item) => [
        item.id, item.chave_nf, item.modelo, item.cnpj_emitente,
        item.status, item.status_sefaz,
        item.cache_hit ? 'Sim' : 'Não',
        getAuditoriaCost(item) ?? '',
        item.criado_em, item.processado_em ?? '',
      ])
    )
    toast.success('CSV de auditoria exportado.')
  }

  const exportDisabled = filteredItems.length === 0 || loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <MetricCard
          label="Consultas filtradas"
          value={filteredItems.length.toLocaleString('pt-BR')}
          note="Volume total da auditoria no período selecionado."
          tone="var(--accent)"
        />
        <MetricCard
          label="Autorizadas"
          value={autorizadas.toLocaleString('pt-BR')}
          note="Documentos com retorno autorizado na seleção atual."
          tone="var(--info)"
        />
        <MetricCard
          label="Custo acumulado"
          value={`R$ ${custoTotal.toFixed(4)}`}
          note={`${cacheHits.toLocaleString('pt-BR')} consultas com reaproveitamento de cache.`}
          tone="var(--warn)"
        />
      </div>

      {/* Card principal */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
      }}>
        {/* Header com tabs */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', padding: '20px 28px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'color-mix(in srgb, var(--surface-2) 90%, transparent)', border: '1px solid var(--border)', borderRadius: '14px', padding: '4px' }}>
            {/* Tab Auditoria */}
            <button
              type="button"
              onClick={() => setAbaAtiva('auditoria')}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                background: abaAtiva === 'auditoria' ? 'var(--surface)' : 'transparent',
                color: abaAtiva === 'auditoria' ? 'var(--text)' : 'var(--text-muted)',
                fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700,
                cursor: 'pointer',
                boxShadow: abaAtiva === 'auditoria' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <FileText size={14} />
              Auditoria
            </button>

            {/* Tab Webhooks */}
            <button
              type="button"
              onClick={() => { if (isBusinessPlan) setAbaAtiva('webhooks') }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                padding: '8px 16px', borderRadius: '10px', border: 'none',
                background: abaAtiva === 'webhooks' ? 'var(--surface)' : 'transparent',
                color: abaAtiva === 'webhooks' ? 'var(--text)' : 'var(--text-dim)',
                fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700,
                cursor: isBusinessPlan ? 'pointer' : 'default',
                boxShadow: abaAtiva === 'webhooks' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
                opacity: isBusinessPlan ? 1 : 0.7,
              }}
            >
              <Webhook size={14} />
              Logs de Webhook
              {!isBusinessPlan && (
                <>
                  <Lock size={12} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  <InfoTooltip text="Disponível apenas no plano Business" />
                </>
              )}
            </button>
          </div>

          {/* Botão Exportar CSV — só na aba auditoria */}
          {abaAtiva === 'auditoria' && (
            <button
              type="button"
              onClick={handleExport}
              disabled={exportDisabled}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '11px 20px', borderRadius: '14px',
                border: '1px solid var(--border)',
                background: exportDisabled
                  ? 'color-mix(in srgb, var(--surface-2) 70%, transparent)'
                  : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                color: exportDisabled ? 'var(--text-dim)' : 'var(--text)',
                fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700,
                cursor: exportDisabled ? 'not-allowed' : 'pointer',
                opacity: exportDisabled ? 0.55 : 1,
                transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!exportDisabled) {
                  e.currentTarget.style.borderColor = 'var(--border-bright)'
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Download size={14} />
              Exportar CSV
            </button>
          )}
        </div>

        {/* Aba: Webhooks */}
        {abaAtiva === 'webhooks' && (
          <WebhookLogsTab isBusinessPlan={isBusinessPlan} />
        )}

        {/* Aba: Auditoria — Filtros */}
        {abaAtiva === 'auditoria' && (
        <div className="app-filter-panel">
          <div className="app-filter-header"><SlidersHorizontal size={12} />Filtros</div>
          <div className="app-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {['AUTORIZADA', 'CANCELADA', 'DENEGADA', 'DADOS_INCONSISTENTES', 'PENDENTE', 'PROCESSANDO', 'ERRO', 'CACHE_HIT'].map((s) => (
                <option key={s} value={s}>{s === 'CACHE_HIT' ? 'Cache' : s === 'DADOS_INCONSISTENTES' ? 'Dados inconsistentes' : s}</option>
              ))}
            </Select>
            <DateFilters periodo={periodo} onPeriodoChange={setPeriodo} inicio={inicio} onInicioChange={setInicio} fim={fim} onFimChange={setFim} />
          </div>
        </div>
        )}

        {/* Tabela desktop — só auditoria */}
        {abaAtiva === 'auditoria' && (
        <div className="app-data-desktop app-table-shell">
          <Table fixed>
            <colgroup>
              <col style={{ width: '30%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '18%' }} />
            </colgroup>
            <thead>
              <tr>
                <Th>Chave NF-e</Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Modelo</div></Th>
                <Th>Status</Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Custo</div></Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Cache</div></Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Criado / Processado</div></Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TrHover key={i}>
                    {Array.from({ length: 6 }).map((__, j) => (
                      <Td key={j}><Skeleton className="h-4 w-full" /></Td>
                    ))}
                  </TrHover>
                ))
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={6}><Empty message="Nenhuma auditoria encontrada para os filtros selecionados" /></td></tr>
              ) : (
                pageItems.map((v) => (
                  <TrHover key={v.id}>
                    <Td><ChaveNF chave={v.chave_nf} /></Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700,
                          color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)',
                          padding: '3px 7px', borderRadius: '6px',
                          background: v.modelo === '55' ? 'var(--info-dim)' : 'var(--accent-dim)',
                        }}>
                          NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </div>
                    </Td>
                    <Td><Badge status={v.status} /></Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        {getAuditoriaCost(v) ? (
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600, color: 'var(--danger)' }}>
                            − R$ {Number(getAuditoriaCost(v)).toFixed(4)}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {v.cache_hit
                          ? <Badge status="CACHE_HIT" label="Sim" />
                          : <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>}
                      </div>
                    </Td>
                    <Td>
                      <div style={{ textAlign: 'right', lineHeight: 1.6 }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtAgo(v.criado_em)}</div>
                        {v.processado_em && (
                          <div style={{ fontSize: '10px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                            proc. {fmtDate(v.processado_em)}
                          </div>
                        )}
                      </div>
                    </Td>
                  </TrHover>
                ))
              )}
            </tbody>
          </Table>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            label="Auditoria"
            onPageChange={setPage}
          />
        </div>
        )}

        {/* Cards mobile — só auditoria */}
        {abaAtiva === 'auditoria' && (
        <div className="app-data-mobile" style={{ padding: '16px' }}>
          <div className="app-mobile-card-list">
            {loading ? (
              <MobileSkeletonCards />
            ) : filteredItems.length === 0 ? (
              <Empty message="Nenhuma auditoria encontrada para os filtros selecionados" />
            ) : (
              pageItems.map((v) => (
                <div key={v.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>Chave NF-e</div>
                      <ChaveNF chave={v.chave_nf} />
                    </div>
                    <Badge status={v.status} />
                  </div>
                  <MobileField label="Modelo" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)' }}>NF-{v.modelo === '55' ? 'e' : 'Ce'}</span>} />
                  <MobileField label="Custo" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{getAuditoriaCost(v) ? `R$ ${Number(getAuditoriaCost(v)).toFixed(4)}` : '—'}</span>} />
                  <MobileField label="Cache" value={v.cache_hit ? <Badge status="CACHE_HIT" label="Sim" /> : <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Não</span>} />
                  <MobileField label="Criado" value={<span style={{ fontSize: '12px' }}>{fmtAgo(v.criado_em)}</span>} />
                  <MobileField label="Processado" value={<span style={{ fontSize: '12px' }}>{fmtDate(v.processado_em)}</span>} />
                </div>
              ))
            )}
          </div>
          <Pagination page={safePage} totalPages={totalPages} totalItems={filteredItems.length} label="Auditoria" onPageChange={setPage} />
        </div>
        )}
      </div>
    </div>
  )
}

export function ConsumoPage() {
  const [items, setItems] = useState<ExtratoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('')
  const [page, setPage] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('30d')
  const [inicio, setInicio] = useState(toInputDate(subDays(new Date(), 29)))
  const [fim, setFim] = useState(toInputDate(new Date()))

  useEffect(() => {
    setLoading(true)
    dashboardApi.extrato()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(
    () => items.filter((item) => {
      if (tipo && item.tipo !== tipo) return false
      return inDateRange(item.criado_em, periodo, inicio, fim)
    }),
    [items, tipo, periodo, inicio, fim]
  )

  const total = filteredItems.reduce((sum, item) => sum + Number(item.valor), 0)
  const debitos = filteredItems.filter((item) => item.tipo === 'DEBITO')
  const { pageItems, totalPages, safePage } = paginateItems(filteredItems, page)

  useEffect(() => {
    setPage(1)
  }, [tipo, periodo, inicio, fim])

  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [page, safePage])

  function handleExport() {
    exportCsv(
      'extrato.csv',
      ['ID', 'Tipo', 'Valor', 'Custo', 'Saldo antes', 'Saldo depois', 'Descrição', 'Pedido', 'Auditoria', 'Expira em', 'Criado em'],
      filteredItems.map((item) => [
        item.id,
        item.tipo,
        item.valor,
        getExtratoCost(item) ?? '',
        getExtratoSaldoAntes(item) ?? '',
        getExtratoSaldoDepois(item) ?? '',
        item.descricao ?? '',
        item.pedido_id ?? '',
        item.log_auditoria_id ?? '',
        item.expira_em ?? '',
        item.criado_em,
      ])
    )
    toast.success('CSV do extrato exportado.')
  }

  const exportDisabled = filteredItems.length === 0 || loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
        <MetricCard
          label="Lançamentos"
          value={filteredItems.length.toLocaleString('pt-BR')}
          note="Itens do extrato após aplicar os filtros."
          tone="var(--info)"
        />
        <MetricCard
          label="Movimentado"
          value={`R$ ${total.toFixed(2)}`}
          note="Soma financeira do recorte atual."
          tone="var(--danger)"
        />
        <MetricCard
          label="Débitos"
          value={debitos.length.toLocaleString('pt-BR')}
          note="Consumos que impactaram o saldo na seleção atual."
          tone="var(--accent)"
        />
      </div>

      {/* Card principal */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '16px', padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Extrato financeiro
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Filtre os lançamentos por tipo e período.
            </div>
          </div>

          {/* Botão Exportar CSV */}
          <button
            type="button"
            onClick={handleExport}
            disabled={exportDisabled}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 20px', borderRadius: '14px',
              border: '1px solid var(--border)',
              background: exportDisabled
                ? 'color-mix(in srgb, var(--surface-2) 70%, transparent)'
                : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
              color: exportDisabled ? 'var(--text-dim)' : 'var(--text)',
              fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700,
              cursor: exportDisabled ? 'not-allowed' : 'pointer',
              opacity: exportDisabled ? 0.55 : 1,
              transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!exportDisabled) {
                e.currentTarget.style.borderColor = 'var(--border-bright)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>

        {/* Filtros */}
        <div className="app-filter-panel">
          <div className="app-filter-header"><SlidersHorizontal size={12} />Filtros</div>
          <div className="app-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Select label="Tipo" value={tipo} onChange={(e) => setTipo(e.target.value)}>
              <option value="">Todos os tipos</option>
              {['CREDITO', 'DEBITO', 'EXPIRACAO', 'ESTORNO'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <DateFilters periodo={periodo} onPeriodoChange={setPeriodo} inicio={inicio} onInicioChange={setInicio} fim={fim} onFimChange={setFim} />
          </div>
        </div>

        {/* Tabela desktop */}
        <div className="app-data-desktop app-table-shell">
          <Table fixed>
            <colgroup>
              <col style={{ width: '11%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '31%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '9%' }} />
            </colgroup>
            <thead>
              <tr>
                <Th>Tipo</Th>
                <Th><div style={{ textAlign: 'right' }}>Valor</div></Th>
                <Th><div style={{ textAlign: 'right' }}>Saldo antes → depois</div></Th>
                <Th>Descrição</Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Referência</div></Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Data</div></Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TrHover key={i}>
                    {Array.from({ length: 6 }).map((__, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}
                  </TrHover>
                ))
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={6}><Empty message="Nenhum lançamento encontrado para os filtros selecionados" /></td></tr>
              ) : (
                pageItems.map((c) => {
                  const saldoAntes = getExtratoSaldoAntes(c)
                  const saldoDepois = getExtratoSaldoDepois(c)
                  const ref = c.pedido_id ?? c.log_auditoria_id
                  const refTipo = c.pedido_id ? 'P' : c.log_auditoria_id ? 'A' : null
                  const isNegativo = c.tipo === 'DEBITO' || c.tipo === 'EXPIRACAO'

                  return (
                    <TrHover key={c.id}>
                      <Td><Badge status={c.tipo} /></Td>
                      <Td>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700,
                            color: isNegativo ? 'var(--danger)' : 'var(--accent)',
                            letterSpacing: '-0.01em',
                          }}>
                            {isNegativo ? '−' : '+'}&nbsp;R$&nbsp;{Number(c.valor).toFixed(4)}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '11px', lineHeight: 1.5 }}>
                          {saldoAntes && saldoDepois ? (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                              <span style={{ color: 'var(--text-dim)' }}>R$ {Number(saldoAntes).toFixed(2)}</span>
                              <span style={{ color: 'var(--border-bright)', fontSize: '10px' }}>→</span>
                              <span style={{ color: 'var(--text)', fontWeight: 600 }}>R$ {Number(saldoDepois).toFixed(2)}</span>
                            </span>
                          ) : saldoDepois ? (
                            <span style={{ color: 'var(--text)', fontWeight: 600 }}>R$ {Number(saldoDepois).toFixed(2)}</span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)' }}>—</span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div
                          style={{
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            fontSize: '13px', color: 'var(--text-muted)',
                          }}
                          title={c.descricao ?? ''}
                        >
                          {c.descricao ?? <span style={{ color: 'var(--text-dim)' }}>—</span>}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ textAlign: 'right' }}>
                          {ref ? (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <span style={{ fontSize: '9px', fontWeight: 800, color: 'var(--text-dim)', letterSpacing: '0.1em', padding: '1px 4px', borderRadius: '4px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>{refTipo}</span>
                              {ref.slice(0, 8)}…
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '12px', whiteSpace: 'nowrap', color: 'var(--text-muted)' }}>{fmtAgo(c.criado_em)}</div>
                          {c.expira_em && (
                            <div style={{ fontSize: '10px', whiteSpace: 'nowrap', color: 'var(--warn)', marginTop: '2px' }}>
                              exp. {fmtDate(c.expira_em)}
                            </div>
                          )}
                        </div>
                      </Td>
                    </TrHover>
                  )
                })
              )}
            </tbody>
          </Table>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            label="Extrato"
            onPageChange={setPage}
          />
        </div>

        {/* Cards mobile */}
        <div className="app-data-mobile" style={{ padding: '16px' }}>
          <div className="app-mobile-card-list">
            {loading ? (
              <MobileSkeletonCards />
            ) : filteredItems.length === 0 ? (
              <Empty message="Nenhum lançamento encontrado para os filtros selecionados" />
            ) : (
              pageItems.map((c) => {
                const saldoAntes = getExtratoSaldoAntes(c)
                const saldoDepois = getExtratoSaldoDepois(c)
                const ref = c.pedido_id ?? c.log_auditoria_id
                const refTipo = c.pedido_id ? 'Pedido' : 'Auditoria'
                const isNegativo = c.tipo === 'DEBITO' || c.tipo === 'EXPIRACAO'

                return (
                  <div key={c.id} style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                      <Badge status={c.tipo} />
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700,
                        color: isNegativo ? 'var(--danger)' : 'var(--accent)',
                      }}>
                        {isNegativo ? '−' : '+'} R$ {Number(c.valor).toFixed(4)}
                      </span>
                    </div>
                    {(saldoAntes || saldoDepois) && (
                      <MobileField label="Saldo" value={
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {saldoAntes && <span style={{ color: 'var(--text-dim)' }}>R$ {Number(saldoAntes).toFixed(2)}</span>}
                          {saldoAntes && saldoDepois && <span style={{ color: 'var(--text-dim)', fontSize: '10px' }}>→</span>}
                          {saldoDepois && <span style={{ color: 'var(--text)', fontWeight: 600 }}>R$ {Number(saldoDepois).toFixed(2)}</span>}
                        </span>
                      } />
                    )}
                    {c.descricao && <MobileField label="Descrição" value={<span style={{ fontSize: '12px' }}>{c.descricao}</span>} />}
                    {ref && <MobileField label={refTipo} value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{ref.slice(0, 12)}…</span>} />}
                    {c.expira_em && <MobileField label="Expira em" value={<span style={{ fontSize: '12px', color: 'var(--warn)' }}>{fmtDate(c.expira_em)}</span>} />}
                    <MobileField label="Data" value={<span style={{ fontSize: '12px' }}>{fmtAgo(c.criado_em)}</span>} />
                  </div>
                )
              })
            )}
          </div>
          <Pagination page={safePage} totalPages={totalPages} totalItems={filteredItems.length} label="Extrato" onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

export function PagamentosPage() {
  const [items, setItems] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingDetalhe, setLoadingDetalhe] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<PedidoDetalhe | null>(null)
  const [status, setStatus] = useState('')
  const [metodo, setMetodo] = useState('')
  const [page, setPage] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('30d')
  const [inicio, setInicio] = useState(toInputDate(subDays(new Date(), 29)))
  const [fim, setFim] = useState(toInputDate(new Date()))
  const [sandbox, setSandbox] = useState(false)

  useEffect(() => {
    pedidosApi.config().then(cfg => setSandbox(cfg.sandbox)).catch(() => null)
    pedidosApi.listar().then(setItems).finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (!matchesPedidoStatusFilter(item.status, status)) return false
        if (metodo && item.metodo !== metodo) return false
        return inDateRange(item.criado_em, periodo, inicio, fim)
      }),
    [items, status, metodo, periodo, inicio, fim]
  )
  const totalPedidos = filteredItems.reduce((sum, item) => sum + Number(item.valor), 0)
  const pagos = filteredItems.filter((item) => item.status === 'PAGO').length
  const pendentes = filteredItems.filter((item) => item.status === 'PENDENTE' || item.status === 'AGUARDANDO_PAGAMENTO').length
  const { pageItems, totalPages, safePage } = paginateItems(filteredItems, page)

  const oldestExpiracao = useMemo(() => {
    const comExpiracao = items.filter((item) => item.status === 'PAGO' && item.credito_expira_em)
    if (!comExpiracao.length) return null
    comExpiracao.sort((a, b) => new Date(a.credito_expira_em!).getTime() - new Date(b.credito_expira_em!).getTime())
    return comExpiracao[0].credito_expira_em!
  }, [items])

  function paymentTone(method: Pedido['metodo']) {
    if (method === 'PIX') return { color: 'var(--accent)', bg: 'var(--accent-dim)', icon: <Sparkles size={14} /> }
    if (method === 'BOLETO') return { color: 'var(--warn)', bg: 'var(--warn-dim)', icon: <Landmark size={14} /> }
    return { color: 'var(--info)', bg: 'var(--info-dim)', icon: <CreditCard size={14} /> }
  }

  async function carregarDetalhe(id: string) {
    setLoadingDetalhe(true)
    try {
      const data = await pedidosApi.detalhar(id)
      setPedidoSelecionado(data)
    } catch {
      toast.error('Não foi possível carregar o detalhe do pedido.')
    } finally {
      setLoadingDetalhe(false)
    }
  }

  useEffect(() => {
    setPage(1)
  }, [status, metodo, periodo, inicio, fim])

  useEffect(() => {
    if (safePage !== page) setPage(safePage)
  }, [page, safePage])

  function handleExport() {
    exportCsv(
      'pedidos.csv',
      ['ID', 'Método', 'Valor', 'Status', 'Confirmado em', 'Expira em', 'Crédito expira', 'Criado em'],
      filteredItems.map((item) => [
        item.id,
        item.metodo,
        item.valor,
        item.status,
        item.confirmado_em ?? '',
        item.expira_em ?? '',
        item.credito_expira_em ?? '',
        item.criado_em,
      ])
    )
    toast.success('CSV de pedidos exportado.')
  }

  const exportDisabled = filteredItems.length === 0 || loading

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {sandbox && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '12px', background: 'color-mix(in srgb, var(--warn) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--warn) 30%, var(--border))', fontSize: '13px', color: 'var(--warn, #ca8a04)' }}>
          <Sparkles size={15} style={{ flexShrink: 0 }} />
          <span><strong>Ambiente de testes.</strong> Os pagamentos exibidos aqui não são reais.</span>
        </div>
      )}
      {pedidoSelecionado && (
        <Card>
          <CardHeader className="card-header-responsive">
            <div>
              <CardTitle>Detalhe do pedido</CardTitle>
              <div className="text-xs text-[var(--text-muted)] mt-1">Consulte os dados do pagamento e retome a próxima ação quando necessário.</div>
            </div>
            <button
              type="button"
              onClick={() => carregarDetalhe(pedidoSelecionado.id)}
              disabled={loadingDetalhe}
              style={{
                minHeight: '44px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '0 18px',
                borderRadius: '999px',
                border: '1px solid color-mix(in srgb, var(--accent-glow) 72%, var(--border))',
                background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--accent-dim) 62%, transparent))',
                color: 'var(--text)',
                fontFamily: 'var(--sans)',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 16px 36px rgba(0,212,170,0.12)',
                opacity: loadingDetalhe ? 0.75 : 1,
                cursor: loadingDetalhe ? 'wait' : 'pointer',
              }}
            >
              {loadingDetalhe ? <Spinner size={14} /> : <RefreshCw size={14} />}
              Atualizar
            </button>
          </CardHeader>
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Pedido</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{pedidoSelecionado.id}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Método</div>
                <div style={{ fontSize: '13px', color: 'var(--text)' }}>{pedidoSelecionado.metodo}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Status</div>
                <Badge status={pedidoSelecionado.status} />
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Valor</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>R$ {Number(pedidoSelecionado.valor).toFixed(2)}</div>
              </div>
            </div>

            {pedidoSelecionado.metodo === 'PIX' && pedidoSelecionado.pix_copia_cola && (
              <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {pedidoSelecionado.pix_copia_cola}
              </div>
            )}

            {pedidoSelecionado.metodo === 'BOLETO' && pedidoSelecionado.boleto_linha_digitavel && (
              <div style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)', wordBreak: 'break-all' }}>
                {pedidoSelecionado.boleto_linha_digitavel}
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {pedidoSelecionado.checkout_url && (
                <a
                  href={pedidoSelecionado.checkout_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: '1px solid var(--accent-glow)',
                    background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 56%, transparent))',
                    color: 'var(--text)',
                    textDecoration: 'none',
                    opacity: pedidoPodeContinuar(pedidoSelecionado.status) ? 1 : 0.55,
                    pointerEvents: pedidoPodeContinuar(pedidoSelecionado.status) ? 'auto' : 'none',
                  }}
                >
                  <ExternalLink size={16} />
                  Concluir transação
                </a>
              )}
              {pedidoSelecionado.boleto_url && (
                <a
                  href={pedidoSelecionado.boleto_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 18px',
                    borderRadius: '16px',
                    border: '1px solid var(--border)',
                    background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                    color: 'var(--text)',
                    textDecoration: 'none',
                  }}
                >
                  <ExternalLink size={16} />
                  Abrir boleto
                </a>
              )}
            </div>
          </div>
        </Card>
      )}

      <div
        className="grid grid-cols-3 gap-4 management-grid-3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}
      >
        <MetricCard
          label="Pedidos"
          value={filteredItems.length.toLocaleString('pt-BR')}
          note="Registros encontrados no recorte atual."
          tone="var(--info)"
        />
        <MetricCard
          label="Volume financeiro"
          value={`R$ ${totalPedidos.toFixed(2)}`}
          note={`${pagos.toLocaleString('pt-BR')} pagos e ${pendentes.toLocaleString('pt-BR')} pendentes na seleção.`}
          tone="var(--accent)"
        />
        <MetricCard
          label="Aguardando pagamento"
          value={pendentes.toLocaleString('pt-BR')}
          note="Pedidos que ainda dependem de confirmação."
          tone="var(--warn)"
        />
        <MetricCard
          label="Expiração do saldo mais antigo"
          value={oldestExpiracao ? fmtDate(oldestExpiracao) : '—'}
          note="Vencimento do crédito ativo mais antigo. Confira o extrato para detalhes."
          tone="var(--danger)"
        />
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
      }}>
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '16px', padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Histórico de pedidos
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Filtre por status, método e período.
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={exportDisabled}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              padding: '11px 20px', borderRadius: '14px',
              border: '1px solid var(--border)',
              background: exportDisabled
                ? 'color-mix(in srgb, var(--surface-2) 70%, transparent)'
                : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
              color: exportDisabled ? 'var(--text-dim)' : 'var(--text)',
              fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700,
              cursor: exportDisabled ? 'not-allowed' : 'pointer',
              opacity: exportDisabled ? 0.55 : 1,
              transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!exportDisabled) {
                e.currentTarget.style.borderColor = 'var(--border-bright)'
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.10)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border)'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>

        <div className="app-filter-panel">
          <div className="app-filter-header"><SlidersHorizontal size={12} />Filtros</div>
          <div className="app-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {['PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Método" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="">Todos os métodos</option>
              {['PIX', 'BOLETO'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <DateFilters periodo={periodo} onPeriodoChange={setPeriodo} inicio={inicio} onInicioChange={setInicio} fim={fim} onFimChange={setFim} />
          </div>
        </div>

        <div className="app-data-desktop app-table-shell">
          <Table fixed>
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '19%' }} />
            </colgroup>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Método</Th>
                <Th><div style={{ textAlign: 'right' }}>Valor</div></Th>
                <Th>Status</Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Confirmado em</div></Th>
                <Th><div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>Crédito expira</div></Th>
                <Th><div style={{ textAlign: 'right' }}>Ações</div></Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TrHover key={i}>
                    {Array.from({ length: 7 }).map((__, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}
                  </TrHover>
                ))
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={7}><Empty message="Nenhum pedido encontrado para os filtros selecionados" /></td></tr>
              ) : (
                pageItems.map((p) => (
                  <TrHover key={p.id}>
                    <Td mono>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{`${p.id.slice(0, 8)}…`}</span>
                    </Td>
                    <Td>
                      {(() => {
                        const tone = paymentTone(p.metodo)
                        return (
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '5px 10px', borderRadius: '999px',
                            background: tone.bg, color: tone.color,
                            fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
                            whiteSpace: 'nowrap',
                          }}>
                            {tone.icon}
                            {p.metodo}
                          </span>
                        )
                      })()}
                    </Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                          fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700,
                          color: p.status === 'PAGO' ? 'var(--accent)' : 'var(--warn)',
                        }}>
                          R$ {Number(p.valor).toFixed(2)}
                        </span>
                      </div>
                    </Td>
                    <Td><Badge status={p.status} /></Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', whiteSpace: 'nowrap', color: p.confirmado_em ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                          {fmtDate(p.confirmado_em)}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '12px', whiteSpace: 'nowrap', color: p.credito_expira_em ? 'var(--warn)' : 'var(--text-dim)' }}>
                          {fmtDate(p.credito_expira_em)}
                        </span>
                      </div>
                    </Td>
                    <Td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <Button type="button" variant="ghost" size="sm" onClick={() => carregarDetalhe(p.id)}>
                          Detalhes
                        </Button>
                        {p.checkout_url && (
                          <a
                            href={p.checkout_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: '6px',
                              padding: '8px 12px', borderRadius: '999px',
                              border: '1px solid var(--accent-glow)',
                              background: 'var(--accent-dim)', color: 'var(--accent)',
                              textDecoration: 'none', fontSize: '11px', fontWeight: 700,
                              opacity: pedidoPodeContinuar(p.status) ? 1 : 0.55,
                              pointerEvents: pedidoPodeContinuar(p.status) ? 'auto' : 'none',
                            }}
                          >
                            <ExternalLink size={12} />
                            Concluir
                          </a>
                        )}
                      </div>
                    </Td>
                  </TrHover>
                ))
              )}
            </tbody>
          </Table>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            totalItems={filteredItems.length}
            label="Pedidos"
            onPageChange={setPage}
          />
        </div>

        <div className="app-data-mobile" style={{ padding: '16px' }}>
          <div className="app-mobile-card-list">
            {loading ? (
              <MobileSkeletonCards />
            ) : filteredItems.length === 0 ? (
              <Empty message="Nenhum pedido encontrado para os filtros selecionados" />
            ) : (
              pageItems.map((p) => (
                <div key={p.id} style={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                    {(() => {
                      const tone = paymentTone(p.metodo)
                      return (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 12px',
                          borderRadius: '999px',
                          background: tone.bg,
                          color: tone.color,
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                        }}>
                          {tone.icon}
                          {p.metodo}
                        </span>
                      )
                    })()}
                    <Badge status={p.status} />
                  </div>
                  <MobileField label="Valor" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: p.status === 'PAGO' ? 'var(--accent)' : 'var(--warn)' }}>R$ {Number(p.valor).toFixed(2)}</span>} />
                  <MobileField label="Confirmado em" value={<span style={{ fontSize: '12px' }}>{fmtDate(p.confirmado_em)}</span>} />
                  <MobileField label="Crédito expira" value={<span style={{ fontSize: '12px' }}>{fmtDate(p.credito_expira_em)}</span>} />
                  <MobileField label="Data" value={<span style={{ fontSize: '12px' }}>{fmtAgo(p.criado_em)}</span>} />
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button type="button" variant="ghost" size="sm" onClick={() => carregarDetalhe(p.id)}>
                      Detalhes
                    </Button>
                    {p.checkout_url && (
                      <a
                        href={p.checkout_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 12px',
                          borderRadius: '999px',
                          border: '1px solid var(--accent-glow)',
                          background: 'var(--accent-dim)',
                          color: 'var(--accent)',
                          textDecoration: 'none',
                          fontSize: '11px',
                          fontWeight: 700,
                          opacity: pedidoPodeContinuar(p.status) ? 1 : 0.55,
                          pointerEvents: pedidoPodeContinuar(p.status) ? 'auto' : 'none',
                        }}
                      >
                        <ExternalLink size={12} />
                        Concluir
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          <Pagination page={safePage} totalPages={totalPages} totalItems={filteredItems.length} label="Pedidos" onPageChange={setPage} />
        </div>
      </div>
    </div>
  )
}

// ─── Simulador client-side ────────────────────────────────────────────────────

interface SimFaixa {
  faixa: string
  consultas: number
  preco_unitario: number
  custo: number
}

interface SimResultado {
  plano: PlanoCatalogo
  quantidade: number
  mensalidade: number
  franquiaConsultas: number
  franquiaUsada: number
  excessoConsultas: number
  custoExcesso: number
  custoTotal: number
  custoMedio: number
  detalhes: SimFaixa[]
}

function faixaLabel(faixa: FaixaPreco, index: number, todas: FaixaPreco[]): string {
  const prevLimit = index === 0 ? 0 : (todas[index - 1].limite_superior ?? 0)
  const low = (prevLimit + 1).toLocaleString('pt-BR')
  const high = faixa.limite_superior ? faixa.limite_superior.toLocaleString('pt-BR') : '+'
  return `${low}–${high}`
}

function calcularSimulacao(plano: PlanoCatalogo, quantidade: number, faixas: FaixaPreco[]): SimResultado {
  const mensalidade = parseFloat(plano.mensalidade)
  const franquia = plano.franquia_consultas
  const franquiaUsada = Math.min(quantidade, franquia)
  const excesso = Math.max(0, quantidade - franquia)

  const detalhes: SimFaixa[] = []
  let custoExcesso = 0

  if (plano.excedente_inicia_faixa === 0) {
    // BASICO: preço único (Faixa 1), sem progressão de faixas
    if (excesso > 0 && faixas.length > 0) {
      const faixa = faixas[0]
      const price = parseFloat(faixa.preco_base) + parseFloat(faixa.adicional_fixo)
      const cost = excesso * price
      detalhes.push({ faixa: `1–+`, consultas: excesso, preco_unitario: price, custo: cost })
      custoExcesso = cost
    }
  } else {
    // PRO/BUSINESS: faixas progressivas a partir de excedente_inicia_faixa (1-based)
    const startIdx = plano.excedente_inicia_faixa - 1
    let prevLimit = startIdx > 0 ? (faixas[startIdx - 1].limite_superior ?? 0) : 0
    let remaining = excesso

    for (let i = startIdx; i < faixas.length && remaining > 0; i++) {
      const faixa = faixas[i]
      const tierMax = faixa.limite_superior ?? Infinity
      const tierSize = tierMax === Infinity ? remaining : (tierMax as number) - prevLimit
      const qty = Math.min(remaining, tierSize)
      const price = parseFloat(faixa.preco_base)
      const cost = qty * price
      detalhes.push({ faixa: faixaLabel(faixa, i, faixas), consultas: qty, preco_unitario: price, custo: cost })
      custoExcesso += cost
      remaining -= qty
      if (tierMax !== Infinity) prevLimit = tierMax as number
    }
  }

  const custoTotal = mensalidade + custoExcesso
  const custoMedio = quantidade > 0 ? custoTotal / quantidade : 0
  return { plano, quantidade, mensalidade, franquiaConsultas: franquia, franquiaUsada, excessoConsultas: excesso, custoExcesso, custoTotal, custoMedio, detalhes }
}

const SIM_PLAN_COLOR: Record<string, string> = {
  BASICO: '#94a3b8',
  PRO: 'var(--accent)',
  BUSINESS: '#8b5cf6',
}

export function SimuladorPage() {
  const [planos, setPlanos] = useState<PlanoCatalogo[]>(FALLBACK_PAID_PLANOS)
  const [faixas, setFaixas] = useState<FaixaPreco[]>(FALLBACK_FAIXAS)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('BASICO')
  const [qtd, setQtd] = useState('1000')
  const [resultado, setResultado] = useState<SimResultado | null>(null)
  const presets = ['500', '1000', '2500', '5000', '10000']

  useEffect(() => {
    planosApi.listar()
      .then(list => {
        const paid = sortPlanos(list.filter(p => (PAID_PLAN_IDS as readonly string[]).includes(p.id)))
        if (paid.length > 0) setPlanos(paid)
      })
      .catch(() => {})
    faixasApi.listar()
      .then(list => { if (list.length > 0) setFaixas(list) })
      .catch(() => {})
  }, [])

  const selectedPlano = planos.find(p => p.id === selectedPlanId) ?? planos[0]

  function calcular() {
    const n = parseInt(qtd)
    if (isNaN(n) || n < 1 || n > 100_000) { toast.error('Entre 1 e 100.000 consultas'); return }
    if (!selectedPlano) return
    setResultado(calcularSimulacao(selectedPlano, n, faixas))
  }

  function f2(n: number) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }
  function f4(n: number) { return n.toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 }) }

  function metricSurface(tone: string): React.CSSProperties {
    return {
      background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 99%, transparent))',
      border: '1px solid var(--border)',
      borderTop: `3px solid ${tone}`,
      borderRadius: '22px',
      boxShadow: '0 18px 40px rgba(15,23,42,0.08)',
      overflow: 'hidden',
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* ── Configuração ─────────────────────────────────────────────────────── */}
      <Card>
        {/* Header */}
        <div style={{
          padding: '34px 34px 28px',
          borderBottom: '1px solid var(--border)',
          background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--accent-dim) 55%, transparent) 0%, transparent 34%), radial-gradient(circle at top right, color-mix(in srgb, var(--info-dim) 50%, transparent) 0%, transparent 28%), linear-gradient(135deg, color-mix(in srgb, var(--surface) 78%, var(--accent-dim) 22%), color-mix(in srgb, var(--surface) 88%, var(--info-dim) 12%))',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content', padding: '9px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--accent-glow)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)' }}>
            SIMULADOR DE CUSTO
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', maxWidth: '820px', lineHeight: 1.05 }}>
            Simule o custo mensal por plano e volume
          </div>
          <div style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '820px' }}>
            Escolha um <strong style={{ color: 'var(--text)' }}>plano</strong>, informe a quantidade de consultas esperada e veja o custo total detalhado com mensalidade, franquia incluída e excedente por faixa progressiva.
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '28px 34px 34px' }}>
          {/* ── Seleção de plano ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Selecione o plano
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
              {planos.map(plano => {
                const isSelected = plano.id === selectedPlanId
                const color = SIM_PLAN_COLOR[plano.id] ?? 'var(--text-muted)'
                return (
                  <button
                    key={plano.id}
                    type="button"
                    onClick={() => { setSelectedPlanId(plano.id); setResultado(null) }}
                    style={{
                      textAlign: 'left',
                      padding: '18px 20px',
                      borderRadius: '18px',
                      border: `2px solid ${isSelected ? color : 'var(--border)'}`,
                      background: isSelected
                        ? `color-mix(in srgb, ${color} 9%, var(--surface))`
                        : 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: isSelected ? color : 'var(--text-dim)' }}>
                      {plano.nome}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '3px' }}>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '22px', fontWeight: 800, color: isSelected ? color : 'var(--text)', letterSpacing: '-0.02em' }}>
                        R$ {f2(parseFloat(plano.mensalidade))}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>/mês</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                      {plano.franquia_consultas > 0
                        ? `${plano.franquia_consultas.toLocaleString('pt-BR')} consultas incluídas`
                        : 'Cobrança por uso desde a 1ª consulta'}
                    </div>
                    {isSelected && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '4px' }}>
                        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
                        <span style={{ fontSize: '10px', fontWeight: 700, color, letterSpacing: '0.08em' }}>SELECIONADO</span>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Volume e botão ── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
              Atalhos de volume
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {presets.map((preset) => {
                const ativo = qtd === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setQtd(preset)}
                    style={{
                      padding: '10px 18px',
                      borderRadius: '999px',
                      border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: ativo
                        ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 86%, transparent), color-mix(in srgb, var(--info-dim) 40%, transparent))'
                        : 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))',
                      color: ativo ? 'var(--accent)' : 'var(--text-muted)',
                      fontFamily: 'var(--mono)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: ativo ? '0 8px 20px rgba(0,212,170,0.10)' : 'none',
                    }}
                  >
                    {Number(preset).toLocaleString('pt-BR')}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="simulator-controls" style={{ display: 'flex', gap: '16px', alignItems: 'stretch' }}>
            <div style={{
              flex: 1, padding: '20px 24px', borderRadius: '22px',
              border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 55%, transparent)',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Consultas esperadas no mês
              </div>
              <input
                type="number"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                min={1}
                max={100000}
                className="simulator-input"
                style={{
                  width: '100%', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)',
                  border: '1px solid var(--border)', borderRadius: '14px', padding: '14px 18px',
                  fontSize: '22px', fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--text)',
                  outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-dim)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                Informe o volume mensal esperado para o plano selecionado.
              </div>
            </div>
            <button
              type="button"
              onClick={calcular}
              style={{
                minWidth: '200px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                gap: '10px', padding: '18px 26px', borderRadius: '22px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
                color: '#041311', fontSize: '14px', fontWeight: 800, letterSpacing: '-0.01em',
                cursor: 'pointer', boxShadow: '0 18px 40px rgba(0,212,170,0.24)',
                transition: 'transform 0.12s ease, box-shadow 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,212,170,0.30)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 14px 34px rgba(0,212,170,0.24)' }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              Calcular custo
            </button>
          </div>
        </div>
      </Card>

      {/* ── Estado vazio ─────────────────────────────────────────────────────── */}
      {!resultado && (
        <Card>
          <div style={{
            padding: '28px 30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            {[
              { label: 'Mensalidade + excedente', body: 'O custo total é composto pela mensalidade do plano mais o excedente cobrado por faixa progressiva.' },
              { label: 'Franquia incluída', body: 'Planos PRO e Business incluem consultas gratuitas no mês. O excedente começa apenas após esgotá-las.' },
              { label: 'Compare planos', body: 'Troque o plano selecionado para ver qual se encaixa melhor no seu volume mensal esperado.' },
            ].map(({ label, body }) => (
              <div key={label} style={{ padding: '22px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 30px rgba(15,23,42,0.06)' }}>
                <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '8px' }}>{label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>{body}</div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Resultado ────────────────────────────────────────────────────────── */}
      {resultado && (() => {
        const planColor = SIM_PLAN_COLOR[resultado.plano.id] ?? 'var(--accent)'
        const totalStr = `R$ ${f2(resultado.custoTotal)}`
        return (
          <>
            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div style={metricSurface(planColor)}>
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Custo total mensal</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 800, color: planColor, letterSpacing: '-0.03em' }}>
                    {totalStr}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    Plano <strong style={{ color: 'var(--text)' }}>{resultado.plano.nome}</strong> com {resultado.quantidade.toLocaleString('pt-BR')} consultas/mês.
                  </div>
                </div>
              </div>
              <div style={metricSurface('var(--accent)')}>
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Mensalidade</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                    R$ {f2(resultado.mensalidade)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {resultado.franquiaConsultas > 0
                      ? `Inclui ${resultado.franquiaUsada.toLocaleString('pt-BR')} de ${resultado.franquiaConsultas.toLocaleString('pt-BR')} consultas gratuitas.`
                      : 'Sem franquia incluída — cobrança por uso desde a 1ª consulta.'}
                  </div>
                </div>
              </div>
              <div style={metricSurface(resultado.custoExcesso > 0 ? 'var(--warn)' : 'var(--text-dim)')}>
                <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Custo excedente</div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 800, color: resultado.custoExcesso > 0 ? 'var(--warn)' : 'var(--text-dim)', letterSpacing: '-0.03em' }}>
                    R$ {f2(resultado.custoExcesso)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {resultado.excessoConsultas > 0
                      ? `${resultado.excessoConsultas.toLocaleString('pt-BR')} consultas além da franquia — custo médio R$ ${f4(resultado.custoMedio)}/consulta.`
                      : 'Volume dentro da franquia — sem cobranças adicionais.'}
                  </div>
                </div>
              </div>
            </div>

            {/* Breakdown detalhado */}
            <Card>
              <CardHeader className="card-header-responsive">
                <div>
                  <CardTitle>Composição do custo — {resultado.plano.nome}</CardTitle>
                  <div className="text-xs text-[var(--text-muted)] mt-1">
                    Mensalidade + excedente progressivo para {resultado.quantidade.toLocaleString('pt-BR')} consultas/mês.
                  </div>
                </div>
              </CardHeader>
              <div className="app-data-desktop app-table-shell">
                <Table fixed>
                  <colgroup>
                    <col style={{ width: '26%' }} />
                    <col style={{ width: '20%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '18%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <Th>Item</Th>
                      <Th><div style={{ textAlign: 'right' }}>Consultas</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Preço unit.</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Subtotal</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>% do total</div></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {/* Linha de mensalidade */}
                    <TrHover>
                      <Td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>Mensalidade</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                            {resultado.franquiaConsultas > 0
                              ? `${resultado.franquiaUsada.toLocaleString('pt-BR')} consultas incluídas`
                              : 'Sem franquia'}
                          </span>
                        </div>
                      </Td>
                      <Td mono><div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>
                        {resultado.franquiaUsada > 0 ? resultado.franquiaUsada.toLocaleString('pt-BR') : '—'}
                      </div></Td>
                      <Td mono><div style={{ textAlign: 'right', color: 'var(--text-dim)' }}>—</div></Td>
                      <Td>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>
                            R$ {f2(resultado.mensalidade)}
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                            {resultado.custoTotal > 0 ? ((resultado.mensalidade / resultado.custoTotal) * 100).toFixed(1) : '100.0'}%
                          </span>
                          <div style={{ width: '80px', height: '4px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${resultado.custoTotal > 0 ? (resultado.mensalidade / resultado.custoTotal) * 100 : 100}%`, background: 'var(--accent)', borderRadius: '999px' }} />
                          </div>
                        </div>
                      </Td>
                    </TrHover>
                    {/* Faixas do excedente */}
                    {resultado.detalhes.map((d, i) => {
                      const pct = resultado.custoTotal > 0 ? (d.custo / resultado.custoTotal) * 100 : 0
                      return (
                        <TrHover key={d.faixa}>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>
                                Excedente faixa {i + 1}
                              </span>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', width: 'fit-content',
                                padding: '2px 8px', borderRadius: '6px',
                                border: '1px solid var(--border)', background: 'var(--surface-2)',
                                fontFamily: 'var(--mono)', fontSize: '10px', fontWeight: 700,
                                color: 'var(--text-dim)', letterSpacing: '0.04em',
                              }}>
                                {d.faixa}
                              </span>
                            </div>
                          </Td>
                          <Td mono><div style={{ textAlign: 'right' }}>{d.consultas.toLocaleString('pt-BR')}</div></Td>
                          <Td mono><div style={{ textAlign: 'right' }}>R$ {f4(d.preco_unitario)}</div></Td>
                          <Td>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: 'var(--warn)' }}>
                                R$ {f2(d.custo)}
                              </span>
                            </div>
                          </Td>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                              <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{pct.toFixed(1)}%</span>
                              <div style={{ width: '80px', height: '4px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${pct}%`, background: 'var(--warn)', borderRadius: '999px' }} />
                              </div>
                            </div>
                          </Td>
                        </TrHover>
                      )
                    })}
                    {/* Linha total */}
                    <tr style={{ borderTop: '2px solid var(--border)' }}>
                      <Td>
                        <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text)' }}>Total</span>
                      </Td>
                      <Td mono><div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--text)' }}>
                        {resultado.quantidade.toLocaleString('pt-BR')}
                      </div></Td>
                      <Td mono><div style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '11px' }}>
                        média R$ {f4(resultado.custoMedio)}
                      </div></Td>
                      <Td>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: 800, color: planColor }}>
                            {totalStr}
                          </span>
                        </div>
                      </Td>
                      <Td><div style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dim)' }}>100%</div></Td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              {/* Mobile */}
              <div className="app-data-mobile" style={{ padding: '16px' }}>
                <div className="app-mobile-card-list">
                  {/* Mensalidade mobile */}
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Mensalidade</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>R$ {f2(resultado.mensalidade)}</span>
                    </div>
                    <MobileField label="Franquia" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>
                      {resultado.franquiaConsultas > 0 ? `${resultado.franquiaUsada.toLocaleString('pt-BR')} consultas` : '—'}
                    </span>} />
                  </div>
                  {/* Faixas excedente mobile */}
                  {resultado.detalhes.map((d, i) => (
                    <div key={d.faixa} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text)' }}>Excedente faixa {i + 1}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dim)' }}>{d.faixa}</span>
                        </div>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: 'var(--warn)' }}>R$ {f2(d.custo)}</span>
                      </div>
                      <MobileField label="Consultas" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{d.consultas.toLocaleString('pt-BR')}</span>} />
                      <MobileField label="Preço unit." value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>R$ {f4(d.preco_unitario)}</span>} />
                    </div>
                  ))}
                  {/* Total mobile */}
                  <div style={{ background: `color-mix(in srgb, ${planColor} 8%, var(--surface))`, border: `2px solid ${planColor}`, borderRadius: '16px', padding: '18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '2px' }}>Total mensal</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>{resultado.quantidade.toLocaleString('pt-BR')} consultas</div>
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 800, color: planColor }}>{totalStr}</span>
                  </div>
                </div>
              </div>
            </Card>
          </>
        )
      })()}
    </div>
  )
}

export function CreditosPage() {
  const [sandbox, setSandbox] = useState(false)

  useEffect(() => {
    pedidosApi.config().then(cfg => setSandbox(cfg.sandbox)).catch(() => null)
  }, [])

  return <CreditosCheckout sandbox={sandbox} />
}
