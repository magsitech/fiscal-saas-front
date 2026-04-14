import { useEffect, useMemo, useState } from 'react'
import { endOfDay, format, parseISO, startOfDay, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Banknote, Copy, Download, ExternalLink, Landmark, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { dashboardApi, pedidosApi } from '@/services/api'
import type { AuditoriaItem, ExtratoItem, Pedido, SimuladorResponse } from '@/types'
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
      style={{ padding: '0 8px 8px' }}
    >
      <div className="text-xs text-[var(--text-muted)]">
        {label}: página {page} de {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button type="button" variant="ghost" size="sm" disabled={page === 1} onClick={() => onPageChange(page - 1)}>
          Anterior
        </Button>
        <span className="text-xs font-semibold text-[var(--text-dim)] min-w-[52px] text-center">
          {page}/{totalPages}
        </span>
        <Button type="button" variant="ghost" size="sm" disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
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
            <thead>
              <tr>
                <Th>Chave NF-e</Th>
                <Th>Modelo</Th>
                <Th>CNPJ emitente</Th>
                <Th>Status</Th>
                <Th>Custo</Th>
                <Th>Cache</Th>
                <Th>Data</Th>
                <Th>Processado</Th>
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
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
                        color: v.modelo === '55' ? 'var(--info)' : 'var(--accent)',
                      }}>
                        NF-{v.modelo === '55' ? 'e' : 'Ce'}
                      </span>
                    </Td>
                    <Td mono>{v.cnpj_emitente}</Td>
                    <Td><Badge status={v.status} /></Td>
                    <Td><span style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{v.custo_consulta ? `R$ ${Number(v.custo_consulta).toFixed(4)}` : '-'}</span></Td>
                    <Td>{v.cache_hit ? <Badge status="CACHE_HIT" label="Sim" /> : <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>-</span>}</Td>
                    <Td><span style={{ fontSize: '12px' }}>{fmtAgo(v.criado_em)}</span></Td>
                    <Td><span style={{ fontSize: '12px' }}>{fmtDate(v.processado_em)}</span></Td>
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
            <thead>
              <tr>
                <Th>Tipo</Th>
                <Th>Valor</Th>
                <Th>Saldo resultante</Th>
                <Th>Descrição</Th>
                <Th>Pedido</Th>
                <Th>Auditoria</Th>
                <Th>Expira em</Th>
                <Th>Data</Th>
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
                      <span style={{
                        fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700,
                        color: c.tipo === 'DEBITO' ? 'var(--danger)' : 'var(--accent)',
                      }}>
                        {c.tipo === 'DEBITO' ? '-' : '+'} R$ {Number(c.valor).toFixed(4)}
                      </span>
                    </Td>
                    <Td mono>R$ {Number(c.saldo_resultante).toFixed(2)}</Td>
                    <Td>{c.descricao ?? '-'}</Td>
                    <Td mono>{c.pedido_id ? `${c.pedido_id.slice(0, 8)}…` : '-'}</Td>
                    <Td mono>{c.log_auditoria_id ? `${c.log_auditoria_id.slice(0, 8)}…` : '-'}</Td>
                    <Td><span style={{ fontSize: '12px' }}>{fmtDate(c.expira_em)}</span></Td>
                    <Td><span style={{ fontSize: '12px' }}>{fmtAgo(c.criado_em)}</span></Td>
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
        if (status && item.status !== status) return false
        if (metodo && item.metodo_pagamento !== metodo) return false
        return inDateRange(item.criado_em, periodo, inicio, fim)
      }),
    [items, status, metodo, periodo, inicio, fim]
  )
  const totalPedidos = filteredItems.reduce((sum, item) => sum + Number(item.valor), 0)
  const pagos = filteredItems.filter((item) => item.status === 'PAGO').length
  const pendentes = filteredItems.filter((item) => item.status === 'PENDENTE' || item.status === 'AGUARDANDO_PAGAMENTO').length
  const { pageItems, totalPages, safePage } = paginateItems(filteredItems, page)

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

  return (
    <div className="space-y-4">
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

      <Card>
      <CardHeader className="card-header-responsive">
        <div>
          <CardTitle>Histórico de pedidos</CardTitle>
          <div className="text-xs text-[var(--text-muted)] mt-1">Filtre por status, método e período.</div>
        </div>
        <Button
          variant="ghost"
          icon={<Download size={14} />}
          onClick={handleExport}
          disabled={filteredItems.length === 0 || loading}
          className="min-w-[152px]"
        >
          Exportar CSV
        </Button>
      </CardHeader>

      <div className="app-filter-panel space-y-3">
        <div className="grid gap-3 app-filter-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {['PENDENTE', 'AGUARDANDO_PAGAMENTO', 'PAGO', 'CANCELADO', 'EXPIRADO'].map((item) => (
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
          <thead>
            <tr>
              <Th>ID</Th>
              <Th>Método</Th>
              <Th>Valor</Th>
              <Th>Status</Th>
              <Th>Confirmado em</Th>
              <Th>Crédito expira</Th>
              <Th>Criado em</Th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TrHover key={i}>
                  {Array.from({ length: 7 }).map((__, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}
                </TrHover>
              ))
            ) : filteredItems.length === 0 ? (
              <tr><td colSpan={7}><Empty message="Nenhum pedido encontrado para os filtros selecionados" /></td></tr>
            ) : (
              pageItems.map((p) => (
                <TrHover key={p.id}>
                  <Td><span className="font-mono text-[11px]">{p.id.slice(0, 8)}...</span></Td>
                  <Td><span className={`font-mono text-xs font-semibold ${p.metodo_pagamento === 'PIX' ? 'text-[var(--accent)]' : 'text-[var(--info)]'}`}>{p.metodo_pagamento}</span></Td>
                  <Td><span className="font-mono text-xs font-semibold text-[var(--accent)]">R$ {Number(p.valor).toFixed(2)}</span></Td>
                  <Td><Badge status={p.status} /></Td>
                  <Td><span className="text-xs">{fmtDate(p.confirmado_em)}</span></Td>
                  <Td><span className="text-xs">{fmtDate(p.credito_expira_em)}</span></Td>
                  <Td><span className="text-xs">{fmtDate(p.criado_em)}</span></Td>
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

      <div className="app-data-mobile p-4">
        <div className="app-mobile-card-list">
          {loading ? (
            <MobileSkeletonCards />
          ) : filteredItems.length === 0 ? (
            <Empty message="Nenhum pedido encontrado para os filtros selecionados" />
          ) : (
            pageItems.map((p) => (
              <Card key={p.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-dim)] mb-1">Pedido</div>
                      <span className="font-mono text-[11px] text-[var(--text-muted)]">{p.id.slice(0, 8)}...</span>
                    </div>
                    <Badge status={p.status} />
                  </div>
                  <MobileField label="Método" value={<span className={`font-mono text-xs font-semibold ${p.metodo_pagamento === 'PIX' ? 'text-[var(--accent)]' : 'text-[var(--info)]'}`}>{p.metodo_pagamento}</span>} />
                  <MobileField label="Valor" value={<span className="font-mono text-xs font-semibold text-[var(--accent)]">R$ {Number(p.valor).toFixed(2)}</span>} />
                  <MobileField label="Confirmado em" value={<span className="text-xs">{fmtDate(p.confirmado_em)}</span>} />
                  <MobileField label="Crédito expira" value={<span className="text-xs">{fmtDate(p.credito_expira_em)}</span>} />
                  <MobileField label="Criado em" value={<span className="text-xs">{fmtDate(p.criado_em)}</span>} />
                </div>
              </Card>
            ))
          )}
        </div>
        <Pagination page={safePage} totalPages={totalPages} totalItems={filteredItems.length} label="Pedidos" onPageChange={setPage} />
      </div>
    </Card>
    </div>
  )
}

export function SimuladorPage() {
  const [qtd, setQtd] = useState('1000')
  const [resultado, setResultado] = useState<SimuladorResponse | null>(null)
  const [loading, setLoading] = useState(false)

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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Simulador de custos</CardTitle>
          <span className="text-xs text-[var(--text-muted)]">Planeje o impacto financeiro do próximo lote</span>
        </CardHeader>
        <div className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
            Simula o custo de <strong className="text-[var(--text)]">N consultas</strong> considerando o volume já
            acumulado no seu período atual. A faixa de cobrança é aplicada de forma cumulativa.
          </p>
          <div className="flex gap-4 items-end simulator-controls" style={{ gap: '16px' }}>
            <Input
              label="Quantidade de consultas a simular"
              type="number"
              value={qtd}
              onChange={(e) => setQtd(e.target.value)}
              min={1}
              max={100000}
              className="simulator-input"
            />
            <Button onClick={simular} loading={loading} size="lg" className="min-w-[148px]">Calcular</Button>
          </div>
        </div>
      </Card>

      {resultado && (
        <>
          <div
            className="grid grid-cols-3 gap-4 simulator-results-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}
          >
            <MetricCard
              label="Custo total"
              value={`R$ ${Number(resultado.custo_total).toFixed(2)}`}
              note="Valor previsto para o lote informado."
              tone="var(--accent)"
            />
            <MetricCard
              label="Custo médio por consulta"
              value={`R$ ${resultado.custo_medio_por_consulta}`}
              note="Média unitária estimada após aplicar as faixas."
              tone="var(--info)"
            />
            <MetricCard
              label="Total acumulado após"
              value={(resultado.acumulado_atual + resultado.quantidade).toLocaleString('pt-BR')}
              note="Volume projetado ao final desta simulação."
              tone="var(--warn)"
            />
          </div>

          {resultado.detalhes_por_faixa.length > 0 && (
            <Card>
              <CardHeader className="card-header-responsive"><CardTitle>Breakdown por faixa</CardTitle></CardHeader>
              <Table>
                <thead>
                  <tr>
                    <Th>Faixa</Th>
                    <Th>Consultas</Th>
                    <Th>Preço unitário</Th>
                    <Th>Subtotal</Th>
                    <Th>% do total</Th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.detalhes_por_faixa.map((d) => {
                    const pct = ((Number(d.custo_faixa) / Number(resultado.custo_total)) * 100).toFixed(1)
                    return (
                      <TrHover key={d.faixa}>
                        <Td><Badge status="PROCESSANDO" label={d.faixa} /></Td>
                        <Td mono>{d.consultas.toLocaleString('pt-BR')}</Td>
                        <Td mono>R$ {d.preco_unitario}</Td>
                        <Td><span className="font-mono text-xs font-semibold text-[var(--accent)]">R$ {d.custo_faixa}</span></Td>
                        <Td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden">
                              <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                            <span className="font-mono text-xs text-[var(--text-muted)] w-10">{pct}%</span>
                          </div>
                        </Td>
                      </TrHover>
                    )
                  })}
                </tbody>
              </Table>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

export function CreditosPage() {
  const [metodo, setMetodo] = useState<'PIX' | 'BOLETO'>('PIX')
  const [valor, setValor] = useState('100')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<{ pix?: string; boleto?: string; boletoUrl?: string } | null>(null)

  async function iniciar() {
    const v = parseFloat(valor)
    if (isNaN(v) || v < 50) return toast.error('Valor mínimo: R$ 50,00')
    setLoading(true)
    setResultado(null)
    try {
      const r = await pedidosApi.iniciar(metodo, v)
      if (metodo === 'PIX') setResultado({ pix: r.pix_copia_cola })
      else setResultado({ boleto: r.boleto_linha_digitavel, boletoUrl: r.boleto_url })
      toast.success('Pedido gerado com sucesso!')
    } catch {
      toast.error('Erro ao gerar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function copiar(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Copiado!'))
  }

  return (
    <div style={{ maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Card principal */}
      <Card>
        <CardHeader>
          <CardTitle>Comprar créditos</CardTitle>
        </CardHeader>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Info pré-pago */}
          <div style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-glow)',
            fontSize: '13px',
            lineHeight: 1.7,
          }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Modelo pré-pago.</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>
              Suas recargas ficam registradas em <strong style={{ color: 'var(--text)', fontWeight: 600 }}>pedidos</strong> e o
              saldo acompanha cada consumo no <strong style={{ color: 'var(--text)', fontWeight: 600 }}>financeiro</strong>, com
              desconto aplicado conforme as consultas realizadas.
            </span>
          </div>

          {/* Método de pagamento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: 'var(--text-dim)',
            }}>
              Método de pagamento
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }} className="credit-method-row">
              {(['PIX', 'BOLETO'] as const).map((m) => {
                const ativo = metodo === m
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMetodo(m)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '18px 20px',
                      borderRadius: '20px',
                      border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: ativo
                        ? 'linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--info-dim) 40%, transparent))'
                        : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                      textAlign: 'left',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <span style={{
                        width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`,
                        background: ativo ? 'rgba(0,212,170,0.08)' : 'color-mix(in srgb, var(--surface-2) 90%, transparent)',
                        color: ativo ? 'var(--accent)' : 'var(--text-dim)',
                      }}>
                        {m === 'PIX' ? <Sparkles size={16} /> : <Landmark size={16} />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: ativo ? 'var(--text)' : 'var(--text-muted)' }}>
                          {m === 'PIX' ? 'PIX' : 'Boleto'}
                        </span>
                        <span style={{ fontSize: '11px', color: ativo ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                          {m === 'PIX' ? 'Confirmação instantânea' : '1-3 dias úteis'}
                        </span>
                      </span>
                    </span>
                    <span style={{
                      width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0,
                      background: ativo ? 'var(--accent)' : 'var(--border-bright)',
                      boxShadow: ativo ? '0 0 0 4px rgba(0,212,170,0.15)' : 'none',
                      transition: 'background 0.15s, box-shadow 0.15s',
                    }} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Valor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.14em', color: 'var(--text-dim)',
            }}>
              Valor
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['50', '100', '200', '500', '1000'].map((v) => {
                const ativo = valor === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValor(v)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '999px',
                      border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: ativo
                        ? 'var(--accent-dim)'
                        : 'color-mix(in srgb, var(--surface-2) 88%, transparent)',
                      color: ativo ? 'var(--accent)' : 'var(--text-muted)',
                      fontFamily: 'var(--mono)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s, color 0.15s',
                    }}
                  >
                    <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '3px' }}>R$</span>{v}
                  </button>
                )
              })}
            </div>
            {/* Input de valor customizado */}
            <div style={{ position: 'relative' }}>
              <span style={{
                position: 'absolute',
                left: '18px',
                top: '50%',
                transform: 'translateY(-50%)',
                fontFamily: 'var(--mono)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--text-dim)',
                pointerEvents: 'none',
                userSelect: 'none',
              }}>
                R$
              </span>
              <input
                type="number"
                placeholder="0,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                min={50}
                style={{
                  width: '100%',
                  paddingLeft: '48px',
                  paddingRight: '18px',
                  paddingTop: '16px',
                  paddingBottom: '16px',
                  borderRadius: '16px',
                  border: '1px solid var(--border)',
                  background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)',
                  color: 'var(--text)',
                  fontFamily: 'var(--mono)',
                  fontSize: '18px',
                  fontWeight: 600,
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
                onFocus={e => {
                  e.currentTarget.style.borderColor = 'var(--accent)'
                  e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-dim)'
                }}
                onBlur={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '-4px' }}>
              Valor mínimo: R$ 50,00
            </p>
          </div>

          {/* CTA */}
          <button
            type="button"
            onClick={iniciar}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '18px 24px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: loading
                ? 'color-mix(in srgb, var(--accent) 60%, transparent)'
                : 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
              color: '#041311',
              fontFamily: 'var(--sans)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 8px 28px rgba(0,212,170,0.22)',
              transition: 'opacity 0.15s, box-shadow 0.15s, transform 0.1s',
              letterSpacing: '-0.01em',
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,212,170,0.35)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,212,170,0.22)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
          >
            {loading
              ? <Spinner size={16} />
              : <Banknote size={18} />
            }
            {loading
              ? 'Gerando pedido…'
              : `Gerar ${metodo === 'PIX' ? 'pedido PIX' : 'boleto'} · R$ ${parseFloat(valor) > 0 ? parseFloat(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '—'}`
            }
          </button>
        </div>
      </Card>

      {/* Resultado PIX */}
      {resultado?.pix && (
        <Card>
          <CardHeader>
            <CardTitle>PIX copia e cola</CardTitle>
          </CardHeader>
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                wordBreak: 'break-all',
                color: 'var(--text-muted)',
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                padding: '18px',
                cursor: 'pointer',
                lineHeight: 1.7,
                transition: 'border-color 0.15s',
              }}
              onClick={() => resultado.pix && copiar(resultado.pix)}
            >
              {resultado.pix}
            </div>
            <button
              type="button"
              onClick={() => resultado.pix && copiar(resultado.pix)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px 24px',
                borderRadius: '18px',
                border: '1px solid var(--accent-glow)',
                background: 'linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--info-dim) 40%, transparent))',
                color: 'var(--accent)',
                fontFamily: 'var(--sans)',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '-0.01em',
                transition: 'border-color 0.15s, box-shadow 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--accent)'
                e.currentTarget.style.boxShadow = '0 0 0 4px var(--accent-dim)'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--accent-glow)'
                e.currentTarget.style.boxShadow = 'none'
                e.currentTarget.style.transform = 'translateY(0)'
              }}
              onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <Copy size={16} />
              Copiar código PIX
            </button>
          </div>
        </Card>
      )}

      {/* Resultado Boleto */}
      {resultado?.boleto && (
        <Card>
          <CardHeader>
            <CardTitle>Boleto bancário</CardTitle>
          </CardHeader>
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              wordBreak: 'break-all',
              color: 'var(--text-muted)',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '14px',
              padding: '18px',
              lineHeight: 1.7,
            }}>
              {resultado.boleto}
            </div>
            <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
              <Button
                type="button"
                variant="ghost"
                size="lg"
                icon={<Copy size={14} />}
                onClick={() => resultado.boleto && copiar(resultado.boleto)}
                style={{ flex: 1 }}
              >
                Copiar linha digitável
              </Button>
              {resultado.boletoUrl && (
                <a
                  href={resultado.boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '0 20px',
                    borderRadius: '14px',
                    background: 'var(--accent)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    color: '#041311',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'opacity 0.15s',
                    minHeight: '44px',
                  }}
                >
                  <ExternalLink size={14} />
                  Abrir PDF
                </a>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
