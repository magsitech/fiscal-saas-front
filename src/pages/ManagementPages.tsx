// ─── Validações ──────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { dashboardApi, pagamentosApi } from '@/services/api'
import type { ValidacaoItem, ConsumoItem, Pagamento, SimuladorResponse } from '@/types'
import {
  Card, CardHeader, CardTitle, Badge, ChaveNF,
  Table, Th, Td, TrHover, Empty, Skeleton, Select, Button, Input,
} from '@/components/ui'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return format(parseISO(iso), "dd/MM/yy HH:mm", { locale: ptBR })
}

function fmtAgo(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR })
}

// ─────────────────────────────────────────────────────────────
export function ValidacoesPage() {
  const [items, setItems] = useState<ValidacaoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    dashboardApi.validacoes({ status: status || undefined, limit: 50 })
      .then(setItems).finally(() => setLoading(false))
  }, [status])

  return (
    <Card>
      <CardHeader className="card-header-responsive">
        <CardTitle>Histórico de Validações</CardTitle>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-44"
        >
          <option value="">Todos os status</option>
          {['AUTORIZADA','CANCELADA','DENEGADA','PENDENTE','PROCESSANDO','ERRO','CACHE_HIT'].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </CardHeader>
      <Table>
        <thead>
          <tr>
            <Th>Chave NF-e</Th>
            <Th>Modelo</Th>
            <Th>CNPJ Emitente</Th>
            <Th>Status</Th>
            <Th>Cache</Th>
            <Th>Data</Th>
            <Th>Processado</Th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
              <TrHover key={i}>
                {Array.from({ length: 7 }).map((__, j) => (
                  <Td key={j}><Skeleton className="h-4 w-full" /></Td>
                ))}
              </TrHover>
            ))
            : items.length === 0
              ? <tr><td colSpan={7}><Empty /></td></tr>
              : items.map(v => (
                <TrHover key={v.id}>
                  <Td><ChaveNF chave={v.chave_nf} /></Td>
                  <Td>
                    <span className={`font-mono text-xs font-semibold ${v.modelo === '55' ? 'text-[var(--info)]' : 'text-[var(--accent)]'}`}>
                      NF-{v.modelo === '55' ? 'e' : 'Ce'}
                    </span>
                  </Td>
                  <Td mono>{v.cnpj_emitente}</Td>
                  <Td><Badge status={v.status} /></Td>
                  <Td>
                    {v.cache_hit
                      ? <Badge status="CACHE_HIT" label="Sim" />
                      : <span className="text-[var(--text-dim)] text-xs">—</span>
                    }
                  </Td>
                  <Td><span className="text-xs">{fmtAgo(v.criado_em)}</span></Td>
                  <Td><span className="text-xs">{fmtDate(v.processado_em)}</span></Td>
                </TrHover>
              ))
          }
        </tbody>
      </Table>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
export function ConsumoPage() {
  const [items, setItems] = useState<ConsumoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.consumo({ limit: 50 }).then(setItems).finally(() => setLoading(false))
  }, [])

  const totalGasto = items.reduce((s, c) => s + parseFloat(c.custo), 0)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 management-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Total de Consultas', value: items.length.toLocaleString('pt-BR'), color: 'var(--info)' },
          { label: 'Total Debitado', value: `R$ ${totalGasto.toFixed(2)}`, color: 'var(--danger)' },
          { label: 'Custo Médio', value: items.length ? `R$ ${(totalGasto / items.length).toFixed(4)}` : '—', color: 'var(--accent)' },
        ].map(k => (
          <Card key={k.label}>
            <div className="p-5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">{k.label}</div>
              <div className="font-mono text-xl font-semibold" style={{ color: k.color }}>{k.value}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="card-header-responsive">
          <CardTitle>Auditoria de Consumo de Saldo</CardTitle>
          <span className="text-xs text-[var(--text-muted)]">Débito ocorre a cada solicitação de consulta</span>
        </CardHeader>
        <Table>
          <thead>
            <tr>
              <Th>Chave NF</Th>
              <Th>Faixa</Th>
              <Th>Custo</Th>
              <Th>Saldo Antes</Th>
              <Th>Saldo Depois</Th>
              <Th>Data</Th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <TrHover key={i}>
                  {Array.from({ length: 6 }).map((__, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}
                </TrHover>
              ))
              : items.length === 0
                ? <tr><td colSpan={6}><Empty message="Nenhum consumo registrado" /></td></tr>
                : items.map(c => (
                  <TrHover key={c.id}>
                    <Td><ChaveNF chave={c.chave_nf} /></Td>
                    <Td><Badge status="PROCESSANDO" label={c.faixa} /></Td>
                    <Td><span className="font-mono text-xs text-[var(--danger)] font-semibold">- R$ {parseFloat(c.custo).toFixed(4)}</span></Td>
                    <Td mono>R$ {parseFloat(c.saldo_antes).toFixed(2)}</Td>
                    <Td mono>R$ {parseFloat(c.saldo_depois).toFixed(2)}</Td>
                    <Td><span className="text-xs">{fmtAgo(c.criado_em)}</span></Td>
                  </TrHover>
                ))
            }
          </tbody>
        </Table>
      </Card>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
export function PagamentosPage() {
  const [items, setItems] = useState<Pagamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pagamentosApi.listar().then(setItems).finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="card-header-responsive">
        <CardTitle>Histórico de Pagamentos</CardTitle>
      </CardHeader>
      <Table>
        <thead>
          <tr>
            <Th>ID</Th>
            <Th>Método</Th>
            <Th>Valor</Th>
            <Th>Status</Th>
            <Th>Confirmado em</Th>
            <Th>Criado em</Th>
          </tr>
        </thead>
        <tbody>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
              <TrHover key={i}>
                {Array.from({ length: 6 }).map((__, j) => <Td key={j}><Skeleton className="h-4 w-full" /></Td>)}
              </TrHover>
            ))
            : items.length === 0
              ? <tr><td colSpan={6}><Empty message="Nenhum pagamento encontrado" /></td></tr>
              : items.map(p => (
                <TrHover key={p.id}>
                  <Td><span className="font-mono text-[11px]">{p.id.slice(0, 8)}…</span></Td>
                  <Td>
                    <span className={`font-mono text-xs font-semibold ${p.metodo === 'PIX' ? 'text-[var(--accent)]' : 'text-[var(--info)]'}`}>
                      {p.metodo}
                    </span>
                  </Td>
                  <Td><span className="font-mono text-xs font-semibold text-[var(--accent)]">R$ {parseFloat(p.valor).toFixed(2)}</span></Td>
                  <Td><Badge status={p.status} /></Td>
                  <Td><span className="text-xs">{fmtDate(p.confirmado_em)}</span></Td>
                  <Td><span className="text-xs">{fmtDate(p.criado_em)}</span></Td>
                </TrHover>
              ))
          }
        </tbody>
      </Table>
    </Card>
  )
}

// ─────────────────────────────────────────────────────────────
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
          <CardTitle>Simulador de Custos</CardTitle>
          <span className="text-xs text-[var(--text-muted)]">Planeje a recarga de créditos</span>
        </CardHeader>
        <div className="p-6">
          <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">
            Simula o custo de <strong className="text-[var(--text)]">N consultas</strong> considerando o volume já
            acumulado no seu período atual. A faixa de cobrança é aplicada de forma cumulativa — quanto mais consultar,
            menor o custo por consulta.
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
            <Button onClick={simular} loading={loading}>Calcular</Button>
          </div>
        </div>
      </Card>

      {resultado && (
        <>
          <div className="grid grid-cols-3 gap-4 simulator-results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Custo Total', value: `R$ ${parseFloat(resultado.custo_total).toFixed(2)}`, color: 'var(--accent)' },
              { label: 'Custo Médio / Consulta', value: `R$ ${resultado.custo_medio_por_consulta}`, color: 'var(--info)' },
              { label: 'Total Acumulado Após', value: (resultado.acumulado_atual + resultado.quantidade).toLocaleString('pt-BR'), color: 'var(--warn)' },
            ].map(k => (
              <Card key={k.label}>
                <div className="p-5 text-center">
                  <div className="font-mono text-2xl font-semibold mb-1" style={{ color: k.color }}>{k.value}</div>
                  <div className="text-xs text-[var(--text-muted)]">{k.label}</div>
                </div>
              </Card>
            ))}
          </div>

          {resultado.detalhes_por_faixa.length > 0 && (
            <Card>
              <CardHeader className="card-header-responsive"><CardTitle>Breakdown por Faixa</CardTitle></CardHeader>
              <Table>
                <thead>
                  <tr>
                    <Th>Faixa</Th>
                    <Th>Consultas</Th>
                    <Th>Preço Unitário</Th>
                    <Th>Subtotal</Th>
                    <Th>% do Total</Th>
                  </tr>
                </thead>
                <tbody>
                  {resultado.detalhes_por_faixa.map((d) => {
                    const pct = ((parseFloat(d.custo_faixa) / parseFloat(resultado.custo_total)) * 100).toFixed(1)
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

// ─────────────────────────────────────────────────────────────
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
      const r = await pagamentosApi.iniciar(metodo, v)
      if (metodo === 'PIX') setResultado({ pix: r.pix_copia_cola })
      else setResultado({ boleto: r.boleto_linha_digitavel, boletoUrl: r.boleto_url })
      toast.success('Cobrança gerada com sucesso!')
    } catch {
      toast.error('Erro ao gerar cobrança. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function copiar(text: string) {
    navigator.clipboard.writeText(text).then(() => toast.success('Copiado!'))
  }

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprar Créditos</CardTitle>
        </CardHeader>
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-glow)] text-sm leading-relaxed">
            <span className="text-[var(--accent)] font-semibold">Saldo pré-pago.</span>{' '}
            <span className="text-[var(--text-muted)]">
              Créditos expiram em <strong className="text-[var(--text)]">30 dias</strong> após a confirmação do pagamento.
              Valor mínimo: <strong className="text-[var(--accent)]">R$ 50,00</strong>.
              O débito ocorre a cada consulta solicitada, independente do resultado retornado pela SEFAZ.
            </span>
          </div>

          {/* Método */}
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Método de Pagamento</div>
            <div className="flex gap-3 credit-method-row" style={{ gap: '12px' }}>
              {(['PIX', 'BOLETO'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMetodo(m)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all ${
                    metodo === m
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--border-bright)]'
                  }`}
                >
                  {m === 'PIX' ? '⚡ PIX (imediato)' : '📄 Boleto (1–3 dias úteis)'}
                </button>
              ))}
            </div>
          </div>

          {/* Presets de valor */}
          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Valor</div>
            <div className="flex gap-2 mb-3 flex-wrap">
              {['50', '100', '200', '500', '1000'].map(v => (
                <button
                  key={v}
                  onClick={() => setValor(v)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border transition-all ${
                    valor === v
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-bright)]'
                  }`}
                >
                  R$ {v}
                </button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Ou insira outro valor"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              min={50}
            />
          </div>

          <Button onClick={iniciar} loading={loading} className="w-full justify-center py-3">
            Gerar {metodo === 'PIX' ? 'QR Code PIX' : 'Boleto'}
          </Button>
        </div>
      </Card>

      {/* Resultado */}
      {resultado?.pix && (
        <Card>
          <CardHeader><CardTitle>PIX Copia e Cola</CardTitle></CardHeader>
          <div className="p-5">
            <div
              className="font-mono text-xs break-all text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4 cursor-pointer hover:border-[var(--accent)] transition-colors"
              onClick={() => copiar(resultado.pix!)}
            >
              {resultado.pix}
            </div>
            <button
              onClick={() => copiar(resultado.pix!)}
              className="mt-3 w-full py-2 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-glow)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)] hover:text-black transition-all"
            >
              📋 Copiar código PIX
            </button>
            <p className="text-xs text-[var(--text-dim)] text-center mt-2">O saldo é ativado automaticamente após a confirmação do pagamento</p>
          </div>
        </Card>
      )}

      {resultado?.boleto && (
        <Card>
          <CardHeader><CardTitle>Boleto Bancário</CardTitle></CardHeader>
          <div className="p-5 space-y-3">
            <div className="font-mono text-xs break-all text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4">
              {resultado.boleto}
            </div>
            <div className="flex gap-3 credit-result-actions" style={{ gap: '12px' }}>
              <button
                onClick={() => copiar(resultado.boleto!)}
                className="flex-1 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-sm font-semibold hover:border-[var(--border-bright)] transition-all"
              >
                📋 Copiar linha digitável
              </button>
              {resultado.boletoUrl && (
                <a
                  href={resultado.boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 text-center rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-glow)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)] hover:text-black transition-all"
                >
                  📄 Abrir PDF
                </a>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
