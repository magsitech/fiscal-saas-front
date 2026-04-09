import { useEffect, useState } from 'react'
import { dashboardApi, pedidosApi } from '@/services/api'
import type { AuditoriaItem, ExtratoItem, Pedido, SimuladorResponse } from '@/types'
import {
  Card,
  CardHeader,
  CardTitle,
  Badge,
  ChaveNF,
  Table,
  Th,
  Td,
  TrHover,
  Empty,
  Skeleton,
  Select,
  Button,
  Input,
} from '@/components/ui'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import toast from 'react-hot-toast'

function fmtDate(iso: string | null) {
  if (!iso) return '-'
  return format(parseISO(iso), 'dd/MM/yy HH:mm', { locale: ptBR })
}

function fmtAgo(iso: string) {
  return formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: ptBR })
}

export function ValidacoesPage() {
  const [items, setItems] = useState<AuditoriaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  useEffect(() => {
    setLoading(true)
    dashboardApi.auditoria({ status: status || undefined, limit: 50 })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [status])

  return (
    <Card>
      <CardHeader className="card-header-responsive">
        <CardTitle>Histórico de auditoria fiscal</CardTitle>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-44">
          <option value="">Todos os status</option>
          {['AUTORIZADA', 'CANCELADA', 'DENEGADA', 'PENDENTE', 'PROCESSANDO', 'ERRO', 'CACHE_HIT'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </CardHeader>
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
          ) : items.length === 0 ? (
            <tr><td colSpan={8}><Empty /></td></tr>
          ) : (
            items.map((v) => (
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
                  <span className="font-mono text-xs">
                    {v.custo_consulta ? `R$ ${Number(v.custo_consulta).toFixed(4)}` : '-'}
                  </span>
                </Td>
                <Td>
                  {v.cache_hit ? <Badge status="CACHE_HIT" label="Sim" /> : <span className="text-[var(--text-dim)] text-xs">-</span>}
                </Td>
                <Td><span className="text-xs">{fmtAgo(v.criado_em)}</span></Td>
                <Td><span className="text-xs">{fmtDate(v.processado_em)}</span></Td>
              </TrHover>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  )
}

export function ConsumoPage() {
  const [items, setItems] = useState<ExtratoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [tipo, setTipo] = useState('')

  useEffect(() => {
    setLoading(true)
    dashboardApi.extrato({ tipo: tipo || undefined, limit: 50 })
      .then(setItems)
      .finally(() => setLoading(false))
  }, [tipo])

  const total = items.reduce((sum, item) => sum + Number(item.valor), 0)
  const debitos = items.filter((item) => item.tipo === 'DEBITO')

  return (
    <div className="space-y-4">
      <div
        className="grid grid-cols-3 gap-4 management-grid-3"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}
      >
        {[
          { label: 'Lançamentos', value: items.length.toLocaleString('pt-BR'), color: 'var(--info)' },
          { label: 'Movimentado', value: `R$ ${total.toFixed(2)}`, color: 'var(--danger)' },
          { label: 'Débitos', value: debitos.length.toLocaleString('pt-BR'), color: 'var(--accent)' },
        ].map((k) => (
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
          <CardTitle>Extrato financeiro</CardTitle>
          <Select value={tipo} onChange={(e) => setTipo(e.target.value)} className="w-44">
            <option value="">Todos os tipos</option>
            {['CREDITO', 'DEBITO', 'EXPIRACAO', 'ESTORNO'].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </Select>
        </CardHeader>
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
            ) : items.length === 0 ? (
              <tr><td colSpan={8}><Empty message="Nenhum lançamento registrado" /></td></tr>
            ) : (
              items.map((c) => (
                <TrHover key={c.id}>
                  <Td><Badge status="PROCESSANDO" label={c.tipo} /></Td>
                  <Td>
                    <span className={`font-mono text-xs font-semibold ${c.tipo === 'DEBITO' ? 'text-[var(--danger)]' : 'text-[var(--accent)]'}`}>
                      {c.tipo === 'DEBITO' ? '-' : '+'} R$ {Number(c.valor).toFixed(4)}
                    </span>
                  </Td>
                  <Td mono>R$ {Number(c.saldo_resultante).toFixed(2)}</Td>
                  <Td>{c.descricao ?? '-'}</Td>
                  <Td mono>{c.pedido_id ? `${c.pedido_id.slice(0, 8)}...` : '-'}</Td>
                  <Td mono>{c.log_auditoria_id ? `${c.log_auditoria_id.slice(0, 8)}...` : '-'}</Td>
                  <Td><span className="text-xs">{fmtDate(c.expira_em)}</span></Td>
                  <Td><span className="text-xs">{fmtAgo(c.criado_em)}</span></Td>
                </TrHover>
              ))
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  )
}

export function PagamentosPage() {
  const [items, setItems] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    pedidosApi.listar().then(setItems).finally(() => setLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader className="card-header-responsive">
        <CardTitle>Histórico de pedidos</CardTitle>
      </CardHeader>
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
          ) : items.length === 0 ? (
            <tr><td colSpan={7}><Empty message="Nenhum pedido encontrado" /></td></tr>
          ) : (
            items.map((p) => (
              <TrHover key={p.id}>
                <Td><span className="font-mono text-[11px]">{p.id.slice(0, 8)}...</span></Td>
                <Td>
                  <span className={`font-mono text-xs font-semibold ${p.metodo_pagamento === 'PIX' ? 'text-[var(--accent)]' : 'text-[var(--info)]'}`}>
                    {p.metodo_pagamento}
                  </span>
                </Td>
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
    </Card>
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
      toast.error('Erro ao simular. Verifique a conexao.')
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
            <Button onClick={simular} loading={loading}>Calcular</Button>
          </div>
        </div>
      </Card>

      {resultado && (
        <>
          <div
            className="grid grid-cols-3 gap-4 simulator-results-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}
          >
            {[
              { label: 'Custo total', value: `R$ ${Number(resultado.custo_total).toFixed(2)}`, color: 'var(--accent)' },
              { label: 'Custo médio / consulta', value: `R$ ${resultado.custo_medio_por_consulta}`, color: 'var(--info)' },
              { label: 'Total acumulado após', value: (resultado.acumulado_atual + resultado.quantidade).toLocaleString('pt-BR'), color: 'var(--warn)' },
            ].map((k) => (
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
    if (isNaN(v) || v < 50) return toast.error('Valor minimo: R$ 50,00')
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
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Comprar créditos</CardTitle>
        </CardHeader>
        <div className="p-6 space-y-5">
          <div className="p-4 rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-glow)] text-sm leading-relaxed">
            <span className="text-[var(--accent)] font-semibold">Modelo pré-pago.</span>{' '}
            <span className="text-[var(--text-muted)]">
              O backend registra compras em <strong className="text-[var(--text)]">pedidos</strong> e o saldo em
              <strong className="text-[var(--text)]"> financeiro</strong>. O débito ocorre por consulta.
            </span>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Método de pagamento</div>
            <div className="flex gap-3 credit-method-row" style={{ gap: '12px' }}>
              {(['PIX', 'BOLETO'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMetodo(m)}
                  className={`flex-1 py-3 rounded-lg text-sm font-semibold border transition-all ${
                    metodo === m
                      ? 'border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]'
                      : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:border-[var(--border-bright)]'
                  }`}
                >
                  {m === 'PIX' ? 'PIX (imediato)' : 'Boleto (1-3 dias úteis)'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Valor</div>
            <div className="flex gap-2 mb-3 flex-wrap">
              {['50', '100', '200', '500', '1000'].map((v) => (
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
            Gerar {metodo === 'PIX' ? 'pedido PIX' : 'boleto'}
          </Button>
        </div>
      </Card>

      {resultado?.pix && (
        <Card>
          <CardHeader><CardTitle>PIX copia e cola</CardTitle></CardHeader>
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
              Copiar código PIX
            </button>
          </div>
        </Card>
      )}

      {resultado?.boleto && (
        <Card>
          <CardHeader><CardTitle>Boleto bancário</CardTitle></CardHeader>
          <div className="p-5 space-y-3">
            <div className="font-mono text-xs break-all text-[var(--text-muted)] bg-[var(--surface-2)] border border-[var(--border)] rounded-lg p-4">
              {resultado.boleto}
            </div>
            <div className="flex gap-3 credit-result-actions" style={{ gap: '12px' }}>
              <button
                onClick={() => copiar(resultado.boleto!)}
                className="flex-1 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] text-sm font-semibold hover:border-[var(--border-bright)] transition-all"
              >
                Copiar linha digitável
              </button>
              {resultado.boletoUrl && (
                <a
                  href={resultado.boletoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 text-center rounded-lg bg-[var(--accent-dim)] border border-[var(--accent-glow)] text-[var(--accent)] text-sm font-semibold hover:bg-[var(--accent)] hover:text-black transition-all"
                >
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
