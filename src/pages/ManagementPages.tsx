import { useEffect, useMemo, useState } from 'react'
import { endOfDay, format, parseISO, startOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, Download, Landmark, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardApi, pedidosApi } from '@/services/api'
import type { AuditoriaItem, ExtratoItem, Pedido, SimuladorResponse } from '@/types'
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
    <div
      className="grid gap-3"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', width: '100%' }}
    >
      <Select value={periodo} onChange={(e) => onPeriodoChange(e.target.value as PeriodoFiltro)}>
        <option value="all">Todo o período</option>
        <option value="today">Hoje</option>
        <option value="7d">Últimos 7 dias</option>
        <option value="30d">Últimos 30 dias</option>
        <option value="custom">Intervalo personalizado</option>
      </Select>
      <Input type="date" value={inicio} onChange={(e) => onInicioChange(e.target.value)} disabled={periodo !== 'custom'} />
      <Input type="date" value={fim} onChange={(e) => onFimChange(e.target.value)} disabled={periodo !== 'custom'} />
    </div>
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

export function ValidacoesPage() {
  const [items, setItems] = useState<AuditoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('7d')
  const [inicio, setInicio] = useState(toInputDate(subDays(new Date(), 6)))
  const [fim, setFim] = useState(toInputDate(new Date()))

  useEffect(() => {
    setLoading(true)
    dashboardApi.auditoria({ status: status || undefined, limit: 200 })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [status])

  const filteredItems = useMemo(
    () => items.filter((item) => inDateRange(item.criado_em, periodo, inicio, fim)),
    [items, periodo, inicio, fim]
  )
  const autorizadas = filteredItems.filter((item) => item.status === 'AUTORIZADA').length
  const cacheHits = filteredItems.filter((item) => item.cache_hit).length
  const custoTotal = filteredItems.reduce((sum, item) => sum + Number(item.custo_consulta ?? 0), 0)
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
        item.id,
        item.chave_nf,
        item.modelo,
        item.cnpj_emitente,
        item.status,
        item.status_sefaz,
        item.cache_hit ? 'Sim' : 'Não',
        item.custo_consulta ?? '',
        item.criado_em,
        item.processado_em ?? '',
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
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
          gap: '16px', padding: '24px 28px',
          borderBottom: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
              Histórico de auditoria fiscal
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.55 }}>
              Filtre por status, período e exporte o resultado atual.
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
          <div className="app-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {['AUTORIZADA', 'CANCELADA', 'DENEGADA', 'PENDENTE', 'PROCESSANDO', 'ERRO', 'CACHE_HIT'].map((s) => (
                <option key={s} value={s}>{s === 'CACHE_HIT' ? 'Cache' : s}</option>
              ))}
            </Select>
            <DateFilters periodo={periodo} onPeriodoChange={setPeriodo} inicio={inicio} onInicioChange={setInicio} fim={fim} onFimChange={setFim} />
          </div>
        </div>

        {/* Tabela desktop */}
        <div className="app-data-desktop app-table-shell">
          <Table>
            <colgroup>
              <col style={{ width: '20%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '11%' }} />
              <col style={{ width: '11%' }} />
            </colgroup>
                  <thead>
                    <tr>
                      <Th>Chave NF-e</Th>
                      <Th><div style={{ textAlign: 'right' }}>Modelo</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>CNPJ emitente</div></Th>
                      <Th>Status</Th>
                      <Th><div style={{ textAlign: 'right' }}>Custo</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Cache</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Data</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Processado</div></Th>
                    </tr>
                  </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TrHover key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <Td key={j}><Skeleton className="h-4 w-full" /></Td>
                    ))}
                  </TrHover>
                ))
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={8}><Empty message="Nenhuma auditoria encontrada para os filtros selecionados" /></td></tr>
              ) : (
                pageItems.map((v) => (
                  <TrHover key={v.id}>
                    <Td><ChaveNF chave={v.chave_nf} /></Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                        fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
                        color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)',
                      }}>
                        NF-{v.modelo === '55' ? 'e' : 'Ce'}
                        </span>
                      </div>
                    </Td>
                    <Td mono><div style={{ textAlign: 'right' }}>{v.cnpj_emitente}</div></Td>
                    <Td><Badge status={v.status} /></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{v.custo_consulta ? `R$ ${Number(v.custo_consulta).toFixed(4)}` : '-'}</span></div></Td>
                    <Td><div style={{ display: 'flex', justifyContent: 'flex-end' }}>{v.cache_hit ? <Badge status="CACHE_HIT" label="Sim" /> : <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>-</span>}</div></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px' }}>{fmtAgo(v.criado_em)}</span></div></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px' }}>{fmtDate(v.processado_em)}</span></div></Td>
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

        {/* Cards mobile */}
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
                  <MobileField label="CNPJ emitente" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{v.cnpj_emitente}</span>} />
                  <MobileField label="Custo" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{v.custo_consulta ? `R$ ${Number(v.custo_consulta).toFixed(4)}` : '-'}</span>} />
                  <MobileField label="Cache" value={v.cache_hit ? <Badge status="CACHE_HIT" label="Sim" /> : <span style={{ fontSize: '12px', color: 'var(--text-dim)' }}>Não</span>} />
                  <MobileField label="Criado" value={<span style={{ fontSize: '12px' }}>{fmtAgo(v.criado_em)}</span>} />
                  <MobileField label="Processado" value={<span style={{ fontSize: '12px' }}>{fmtDate(v.processado_em)}</span>} />
                </div>
              ))
            )}
          </div>
          <Pagination page={safePage} totalPages={totalPages} totalItems={filteredItems.length} label="Auditoria" onPageChange={setPage} />
        </div>
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
    dashboardApi.extrato({ tipo: tipo || undefined, limit: 200 })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [tipo])

  const filteredItems = useMemo(
    () => items.filter((item) => inDateRange(item.criado_em, periodo, inicio, fim)),
    [items, periodo, inicio, fim]
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
      ['ID', 'Tipo', 'Valor', 'Saldo resultante', 'Descrição', 'Pedido', 'Auditoria', 'Expira em', 'Criado em'],
      filteredItems.map((item) => [
        item.id,
        item.tipo,
        item.valor,
        item.saldo_resultante,
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
          <Table>
            <colgroup>
              <col style={{ width: '12%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '13%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '9%' }} />
              <col style={{ width: '9%' }} />
            </colgroup>
                  <thead>
                    <tr>
                      <Th>Tipo</Th>
                      <Th><div style={{ textAlign: 'right' }}>Valor</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Saldo resultante</div></Th>
                      <Th>Descrição</Th>
                      <Th><div style={{ textAlign: 'right' }}>Pedido</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Auditoria</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Expira em</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Data</div></Th>
                    </tr>
                  </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TrHover key={i}>
                    {Array.from({ length: 8 }).map((__, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}
                  </TrHover>
                ))
              ) : filteredItems.length === 0 ? (
                <tr><td colSpan={8}><Empty message="Nenhum lançamento encontrado para os filtros selecionados" /></td></tr>
              ) : (
                pageItems.map((c) => (
                  <TrHover key={c.id}>
                    <Td><Badge status="PROCESSANDO" label={c.tipo} /></Td>
                    <Td>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{
                        fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
                        color: c.tipo === 'DEBITO' ? 'var(--danger)' : 'var(--accent)',
                      }}>
                        {c.tipo === 'DEBITO' ? '-' : '+'} R$ {Number(c.valor).toFixed(4)}
                        </span>
                      </div>
                    </Td>
                    <Td mono><div style={{ textAlign: 'right' }}>R$ {Number(c.saldo_resultante).toFixed(2)}</div></Td>
                    <Td>{c.descricao ?? '-'}</Td>
                    <Td mono><div style={{ textAlign: 'right' }}>{c.pedido_id ? `${c.pedido_id.slice(0, 8)}…` : '-'}</div></Td>
                    <Td mono><div style={{ textAlign: 'right' }}>{c.log_auditoria_id ? `${c.log_auditoria_id.slice(0, 8)}…` : '-'}</div></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px' }}>{fmtDate(c.expira_em)}</span></div></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px' }}>{fmtAgo(c.criado_em)}</span></div></Td>
                  </TrHover>
                ))
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
              pageItems.map((c) => (
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
                    <Badge status="PROCESSANDO" label={c.tipo} />
                    <span style={{
                      fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
                      color: c.tipo === 'DEBITO' ? 'var(--danger)' : 'var(--accent)',
                    }}>
                      {c.tipo === 'DEBITO' ? '-' : '+'} R$ {Number(c.valor).toFixed(4)}
                    </span>
                  </div>
                  <MobileField label="Saldo resultante" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>R$ {Number(c.saldo_resultante).toFixed(2)}</span>} />
                  <MobileField label="Descrição" value={c.descricao ?? '-'} />
                  <MobileField label="Pedido" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{c.pedido_id ? `${c.pedido_id.slice(0, 8)}…` : '-'}</span>} />
                  <MobileField label="Auditoria" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{c.log_auditoria_id ? `${c.log_auditoria_id.slice(0, 8)}…` : '-'}</span>} />
                  <MobileField label="Expira em" value={<span style={{ fontSize: '12px' }}>{fmtDate(c.expira_em)}</span>} />
                  <MobileField label="Data" value={<span style={{ fontSize: '12px' }}>{fmtAgo(c.criado_em)}</span>} />
                </div>
              ))
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
  const [status, setStatus] = useState('')
  const [metodo, setMetodo] = useState('')
  const [page, setPage] = useState(1)
  const [periodo, setPeriodo] = useState<PeriodoFiltro>('30d')
  const [inicio, setInicio] = useState(toInputDate(subDays(new Date(), 29)))
  const [fim, setFim] = useState(toInputDate(new Date()))

  useEffect(() => {
    pedidosApi.listar().then(setItems).finally(() => setLoading(false))
  }, [])

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        if (!matchesPedidoStatusFilter(item.status, status)) return false
        if (metodo && item.metodo_pagamento !== metodo) return false
        return inDateRange(item.criado_em, periodo, inicio, fim)
      }),
    [items, status, metodo, periodo, inicio, fim]
  )
  const totalPedidos = filteredItems.reduce((sum, item) => sum + Number(item.valor), 0)
  const pagos = filteredItems.filter((item) => item.status === 'PAGO').length
  const pendentes = filteredItems.filter((item) => item.status === 'PENDENTE' || item.status === 'AGUARDANDO_PAGAMENTO').length
  const { pageItems, totalPages, safePage } = paginateItems(filteredItems, page)

  function paymentTone(method: Pedido['metodo_pagamento']) {
    if (method === 'PIX') return { color: 'var(--accent)', bg: 'var(--accent-dim)', icon: <Sparkles size={14} /> }
    if (method === 'BOLETO') return { color: 'var(--warn)', bg: 'var(--warn-dim)', icon: <Landmark size={14} /> }
    return { color: 'var(--info)', bg: 'var(--info-dim)', icon: <CreditCard size={14} /> }
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
        item.metodo_pagamento,
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
          <div className="app-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos os status</option>
              {['PENDENTE', 'PAGO', 'CANCELADO', 'EXPIRADO'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <Select label="Método" value={metodo} onChange={(e) => setMetodo(e.target.value)}>
              <option value="">Todos os métodos</option>
              {['PIX', 'BOLETO', 'CARTAO'].map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </Select>
            <DateFilters periodo={periodo} onPeriodoChange={setPeriodo} inicio={inicio} onInicioChange={setInicio} fim={fim} onFimChange={setFim} />
          </div>
        </div>

        <div className="app-data-desktop app-table-shell">
          <Table>
            <colgroup>
              <col style={{ width: '18%' }} />
              <col style={{ width: '20%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
            </colgroup>
            <thead>
              <tr>
                <Th>Pedido</Th>
                <Th>Método</Th>
                <Th><div style={{ textAlign: 'right', paddingRight: '10px' }}>Valor</div></Th>
                <Th><div style={{ paddingLeft: '10px' }}>Status</div></Th>
                <Th><div style={{ textAlign: 'right' }}>Confirmado em</div></Th>
                <Th><div style={{ textAlign: 'right' }}>Crédito expira</div></Th>
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
                <tr><td colSpan={6}><Empty message="Nenhum pedido encontrado para os filtros selecionados" /></td></tr>
              ) : (
                pageItems.map((p) => (
                  <TrHover key={p.id}>
                    <Td mono><div style={{ textAlign: 'left' }}>{`${p.id.slice(0, 8)}…`}</div></Td>
                    <Td>
                      {(() => {
                        const tone = paymentTone(p.metodo_pagamento)
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
                            {p.metodo_pagamento}
                          </span>
                        )
                      })()}
                    </Td>
                    <Td>
                      <div style={{ textAlign: 'right', paddingRight: '10px' }}>
                        <span style={{
                        fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
                        color: p.status === 'PAGO' ? 'var(--accent)' : 'var(--warn)',
                      }}>
                        R$ {Number(p.valor).toFixed(2)}
                        </span>
                      </div>
                    </Td>
                    <Td><div style={{ paddingLeft: '10px' }}><Badge status={p.status} /></div></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px' }}>{fmtDate(p.confirmado_em)}</span></div></Td>
                    <Td><div style={{ textAlign: 'right' }}><span style={{ fontSize: '12px' }}>{fmtDate(p.credito_expira_em)}</span></div></Td>
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
                      const tone = paymentTone(p.metodo_pagamento)
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
                          {p.metodo_pagamento}
                        </span>
                      )
                    })()}
                    <Badge status={p.status} />
                  </div>
                  <MobileField label="Valor" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700, color: p.status === 'PAGO' ? 'var(--accent)' : 'var(--warn)' }}>R$ {Number(p.valor).toFixed(2)}</span>} />
                  <MobileField label="Confirmado em" value={<span style={{ fontSize: '12px' }}>{fmtDate(p.confirmado_em)}</span>} />
                  <MobileField label="Crédito expira" value={<span style={{ fontSize: '12px' }}>{fmtDate(p.credito_expira_em)}</span>} />
                  <MobileField label="Data" value={<span style={{ fontSize: '12px' }}>{fmtAgo(p.criado_em)}</span>} />
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

export function SimuladorPage() {
  const [qtd, setQtd] = useState('1000')
  const [resultado, setResultado] = useState<SimuladorResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const presets = ['500', '1000', '2500', '5000', '10000']

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

  async function simular() {
    const n = parseInt(qtd)
    if (!n || n < 1 || n > 100_000) return toast.error('Entre 1 e 100.000 consultas')
    setLoading(true)
    try {
      const r = await dashboardApi.simulador(n)
      setResultado(r)
    } catch {
      toast.error('Erro ao simular. Verifique a conexão.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Card>
        <div style={{
          padding: '34px 34px 28px',
          borderBottom: '1px solid var(--border)',
          background: 'radial-gradient(circle at top left, color-mix(in srgb, var(--accent-dim) 55%, transparent) 0%, transparent 34%), radial-gradient(circle at top right, color-mix(in srgb, var(--info-dim) 50%, transparent) 0%, transparent 28%), linear-gradient(135deg, color-mix(in srgb, var(--surface) 78%, var(--accent-dim) 22%), color-mix(in srgb, var(--surface) 88%, var(--info-dim) 12%))',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content', padding: '9px 14px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', border: '1px solid var(--accent-glow)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', color: 'var(--accent)' }}>
            SIMULADOR
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text)', maxWidth: '820px', lineHeight: 1.05 }}>
            Planeje o custo do próximo lote com mais clareza
          </div>
          <div style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '820px' }}>
            Simule o custo de <strong style={{ color: 'var(--text)' }}>N consultas</strong> considerando o volume já acumulado no período atual. A faixa de cobrança é aplicada de forma cumulativa para mostrar o impacto real da próxima compra.
          </div>
        </div>
        <div className="p-6" style={{ display: 'flex', flexDirection: 'column', gap: '26px', padding: '28px 34px 34px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '14px',
          }}>
            <div style={{ padding: '18px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 34px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '6px' }}>Faixas progressivas</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>O cálculo respeita o preço unitário por volume acumulado.</div>
            </div>
            <div style={{ padding: '18px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 34px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '6px' }}>Visão financeira</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Veja custo total, média por consulta e composição por faixa.</div>
            </div>
            <div style={{ padding: '18px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 34px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '6px' }}>Limite operacional</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>Aceita simulações de 1 a 100.000 consultas por cálculo.</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)' }}>
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
                      padding: '11px 20px',
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
                      boxShadow: ativo ? '0 12px 24px rgba(0,212,170,0.10)' : 'none',
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
              flex: 1,
              padding: '18px',
              borderRadius: '22px',
              border: '1px solid var(--border)',
              background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 99%, transparent))',
              boxShadow: '0 18px 38px rgba(15,23,42,0.08)',
            }}>
              <Input
                label="Quantidade de consultas a simular"
                type="number"
                value={qtd}
                onChange={(e) => setQtd(e.target.value)}
                min={1}
                max={100000}
                className="simulator-input"
                style={{ minHeight: '56px', fontSize: '18px', fontWeight: 700, fontFamily: 'var(--mono)' }}
              />
              <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '10px' }}>
                Informe o volume desejado para calcular o custo incremental nas faixas atuais.
              </div>
            </div>
            <button
              type="button"
              onClick={simular}
              disabled={loading}
              style={{
                minWidth: '220px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '18px 26px',
                borderRadius: '22px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: loading
                  ? 'color-mix(in srgb, var(--accent) 60%, transparent)'
                  : 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
                color: '#041311',
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '-0.01em',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 18px 40px rgba(0,212,170,0.24)',
                transition: 'transform 0.12s ease, box-shadow 0.18s ease, opacity 0.15s ease',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)'
                  e.currentTarget.style.boxShadow = '0 18px 40px rgba(0,212,170,0.30)'
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 14px 34px rgba(0,212,170,0.24)'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? <Spinner size={16} /> : null}
              {loading ? 'Calculando...' : 'Calcular projeção'}
            </button>
          </div>
        </div>
      </Card>

      {!resultado && (
        <Card>
          <div style={{
            padding: '28px 30px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
          }}>
            <div style={{ padding: '22px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 30px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '8px' }}>O que você verá</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Custo total, custo médio por consulta e o breakdown por faixa progressiva.</div>
            </div>
            <div style={{ padding: '22px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 30px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '8px' }}>Quando usar</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Antes de comprar créditos ou estimar impacto financeiro para o próximo lote.</div>
            </div>
            <div style={{ padding: '22px', borderRadius: '20px', border: '1px solid var(--border)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', boxShadow: '0 16px 30px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-dim)', marginBottom: '8px' }}>Leitura rápida</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Use os atalhos acima para testar cenários frequentes em segundos.</div>
            </div>
          </div>
        </Card>
      )}

      {resultado && (
        <>
          <div
            className="grid grid-cols-3 gap-4 simulator-results-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}
          >
            <div style={metricSurface('var(--accent)')}>
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Custo total</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.03em' }}>
                  R$ {Number(resultado.custo_total).toFixed(2)}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Valor previsto para o lote informado.</div>
              </div>
            </div>
            <div style={metricSurface('var(--info)')}>
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Custo médio por consulta</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 800, color: 'var(--info)', letterSpacing: '-0.03em' }}>
                  R$ {resultado.custo_medio_por_consulta}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Média unitária estimada após aplicar as faixas.</div>
              </div>
            </div>
            <div style={metricSurface('var(--warn)')}>
              <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>Total acumulado após</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '32px', fontWeight: 800, color: 'var(--warn)', letterSpacing: '-0.03em' }}>
                  {(resultado.acumulado_atual + resultado.quantidade).toLocaleString('pt-BR')}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Volume projetado ao final desta simulação.</div>
              </div>
            </div>
          </div>

          {resultado.detalhes_por_faixa.length > 0 && (
            <Card>
              <CardHeader className="card-header-responsive">
                <div>
                  <CardTitle>Breakdown por faixa</CardTitle>
                  <div className="text-xs text-[var(--text-muted)] mt-1">Entenda como o volume é distribuído entre as faixas progressivas.</div>
                </div>
              </CardHeader>
              <div className="app-data-desktop app-table-shell">
                <Table>
                  <colgroup>
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '16%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '18%' }} />
                    <col style={{ width: '24%' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <Th>Faixa</Th>
                      <Th><div style={{ textAlign: 'right' }}>Consultas</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Preço unitário</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>Subtotal</div></Th>
                      <Th><div style={{ textAlign: 'right' }}>% do total</div></Th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.detalhes_por_faixa.map((d) => {
                      const pct = ((Number(d.custo_faixa) / Number(resultado.custo_total)) * 100).toFixed(1)
                      return (
                        <TrHover key={d.faixa}>
                          <Td><Badge status="PROCESSANDO" label={d.faixa} /></Td>
                          <Td mono><div style={{ textAlign: 'right' }}>{d.consultas.toLocaleString('pt-BR')}</div></Td>
                          <Td mono><div style={{ textAlign: 'right' }}>R$ {d.preco_unitario}</div></Td>
                          <Td><div style={{ textAlign: 'right' }}><span className="font-mono text-xs font-semibold text-[var(--accent)]">R$ {d.custo_faixa}</span></div></Td>
                          <Td>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                              <span className="font-mono text-xs text-[var(--text-muted)]">{pct}%</span>
                              <div style={{ width: '120px', height: '6px', background: 'var(--surface-2)', borderRadius: '999px', overflow: 'hidden' }}>
                                <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </Td>
                        </TrHover>
                      )
                    })}
                  </tbody>
                </Table>
              </div>
              <div className="app-data-mobile" style={{ padding: '16px' }}>
                <div className="app-mobile-card-list">
                  {resultado.detalhes_por_faixa.map((d) => {
                    const pct = ((Number(d.custo_faixa) / Number(resultado.custo_total)) * 100).toFixed(1)
                    return (
                      <div key={d.faixa} style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        padding: '18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <Badge status="PROCESSANDO" label={d.faixa} />
                          <span className="font-mono text-xs font-semibold text-[var(--accent)]">R$ {d.custo_faixa}</span>
                        </div>
                        <MobileField label="Consultas" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{d.consultas.toLocaleString('pt-BR')}</span>} />
                        <MobileField label="Preço unitário" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>R$ {d.preco_unitario}</span>} />
                        <MobileField label="% do total" value={<span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{pct}%</span>} />
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export function CreditosPage() {
  return <CreditosCheckout />
}
