import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import axios from 'axios'
import {
  Banknote,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Landmark,
  QrCode,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi } from '@/services/api'
import type { IniciarPedidoRequest, MetodoPagamento, PedidoDetalhe } from '@/types'
import { Badge, Card, CardHeader, CardTitle, Spinner } from '@/components/ui'

const POLLING_INTERVAL_MS = 5000

type MetodoAtivo = Extract<MetodoPagamento, 'PIX' | 'BOLETO'>
type CheckoutVisualState = 'idle' | 'loading' | 'awaiting' | 'paid' | 'cancelled' | 'error'
type CheckoutError = {
  title: string
  message: string
  statusCode?: number | null
}

const PAYMENT_OPTIONS: Array<{ id: MetodoAtivo; label: string; note: string; icon: ReactNode }> = [
  { id: 'PIX', label: 'PIX', note: 'Copia e cola imediato com QR Code gerado pelo backend.', icon: <Sparkles size={16} /> },
  { id: 'BOLETO', label: 'Boleto bancário', note: 'Linha digitável e link do boleto vindos do backend.', icon: <Landmark size={16} /> },
]

function fmtMoney(value: string | number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '--'
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return '--'
  return format(parseISO(iso), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

function isFinalStatus(status: string) {
  return status === 'PAGO' || status === 'CANCELADO' || status === 'EXPIRADO'
}

function getGatewayStatus(pedido: Pick<PedidoDetalhe, 'gateway_status' | 'mp_status'>) {
  return pedido.gateway_status ?? pedido.mp_status ?? null
}

function getGatewayStatusDetail(pedido: Pick<PedidoDetalhe, 'gateway_status_detail' | 'mp_status_detail'>) {
  return pedido.gateway_status_detail ?? pedido.mp_status_detail ?? null
}

function normalizePedidoCriadoToDetalhe(response: Awaited<ReturnType<typeof pedidosApi.iniciar>>): PedidoDetalhe {
  return {
    id: response.pedido_id,
    metodo: response.metodo,
    valor: response.valor,
    status: response.status,
    gateway_status: response.gateway_status ?? response.mp_status ?? null,
    gateway_status_detail: response.gateway_status_detail ?? response.mp_status_detail ?? null,
    mp_status: response.gateway_status ?? response.mp_status ?? null,
    mp_status_detail: response.gateway_status_detail ?? response.mp_status_detail ?? null,
    descricao: null,
    gateway_id: response.gateway_id ?? null,
    gateway_payload: response.gateway_payload ?? null,
    checkout_url: response.checkout_url ?? null,
    pix_copia_cola: response.pix_copia_cola ?? null,
    pix_qr_code_url: response.pix_qr_code_url ?? null,
    boleto_linha_digitavel: response.boleto_linha_digitavel ?? null,
    boleto_url: response.boleto_url ?? null,
    expira_em: response.expira_em ?? null,
    credito_expira_em: response.credito_expira_em ?? null,
    confirmado_em: response.confirmado_em ?? null,
    criado_em: response.criado_em ?? new Date().toISOString(),
    credito_lancado: response.credito_lancado ?? false,
  }
}

function getVisualState(pedido: PedidoDetalhe | null, pedidoError: string | null, loading: boolean): CheckoutVisualState {
  if (loading) return 'loading'
  if (pedidoError) return 'error'
  if (!pedido) return 'idle'
  if (pedido.status === 'PAGO') return 'paid'
  if (pedido.status === 'CANCELADO' || pedido.status === 'EXPIRADO') return 'cancelled'
  return 'awaiting'
}

function getStatusMessage(pedido: PedidoDetalhe) {
  if (pedido.status === 'PAGO') {
    return pedido.credito_lancado
      ? 'Pagamento confirmado pelo backend e crédito já lançado. Você pode seguir com segurança.'
      : 'Pagamento confirmado pelo backend. Aguarde apenas a conciliação final do crédito, se necessário.'
  }
  if (pedido.status === 'AGUARDANDO_PAGAMENTO') {
    return 'Pedido aguardando pagamento. O fluxo só avança quando o backend receber a confirmação oficial do webhook.'
  }
  if (pedido.status === 'CANCELADO') {
    return 'Pagamento cancelado. Gere um novo pedido para continuar a compra de créditos.'
  }
  if (pedido.status === 'EXPIRADO') {
    return 'Pagamento expirado. Gere um novo pedido para receber novos dados de cobrança.'
  }
  return 'Pedido criado. Aguardando atualização oficial do backend.'
}

function isQrImageSource(value?: string | null) {
  return typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))
}

function resolveQrCodeSource(value?: string | null) {
  if (!value) return null
  if (isQrImageSource(value)) return value
  return `data:image/png;base64,${value}`
}

function buildCheckoutError(error: unknown, fallback: string): CheckoutError {
  if (!axios.isAxiosError(error)) {
    return {
      title: 'Erro ao gerar cobrança',
      message: fallback,
      statusCode: null,
    }
  }

  const statusCode = error.response?.status ?? null
  const payload = error.response?.data
  if (typeof payload === 'string' && payload.trim()) {
    return {
      title: 'Falha ao criar o pedido',
      message: payload,
      statusCode,
    }
  }

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    if (typeof record.detail === 'string' && record.detail.trim()) {
      return { title: 'Falha ao criar o pedido', message: record.detail, statusCode }
    }
    if (typeof record.message === 'string' && record.message.trim()) {
      return { title: 'Falha ao criar o pedido', message: record.message, statusCode }
    }
    if (typeof record.mensagem === 'string' && record.mensagem.trim()) {
      return { title: 'Falha ao criar o pedido', message: record.mensagem, statusCode }
    }

    if (Array.isArray(record.detail)) {
      const firstIssue = record.detail.find((item) => item && typeof item === 'object') as Record<string, unknown> | undefined
      if (firstIssue && typeof firstIssue.msg === 'string' && firstIssue.msg.trim()) {
        return { title: 'Dados inválidos para cobrança', message: firstIssue.msg, statusCode }
      }
    }

    if (Array.isArray(record.errors)) {
      const firstError = record.errors.find((item) => typeof item === 'string')
      if (typeof firstError === 'string' && firstError.trim()) {
        return { title: 'Falha ao criar o pedido', message: firstError, statusCode }
      }
    }
  }

  if (statusCode === 401) {
    return {
      title: 'Sessão expirada',
      message: 'Sua sessão expirou ou o usuário não está autenticado. Faça login novamente e tente outra vez.',
      statusCode,
    }
  }
  if (statusCode === 403) {
    return {
      title: 'Acesso negado',
      message: 'Você não tem permissão para criar este pedido.',
      statusCode,
    }
  }
  if (statusCode === 422) {
    return {
      title: 'Dados rejeitados pelo backend',
      message: 'O backend rejeitou os dados enviados para gerar a cobrança.',
      statusCode,
    }
  }
  if (statusCode && statusCode >= 500) {
    return {
      title: 'Falha interna no backend',
      message: 'O servidor não conseguiu gerar a cobrança neste momento.',
      statusCode,
    }
  }

  return {
    title: 'Erro ao gerar cobrança',
    message: fallback,
    statusCode,
  }
}

function actionButtonStyle(tone: 'accent' | 'neutral' = 'accent', disabled = false): CSSProperties {
  return {
    flex: 1,
    minHeight: '56px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    padding: '0 18px',
    borderRadius: '18px',
    border: tone === 'accent' ? '1px solid var(--accent-glow)' : '1px solid var(--border)',
    background: tone === 'accent'
      ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 56%, transparent))'
      : 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))',
    color: tone === 'accent' ? 'var(--text)' : 'var(--text-muted)',
    textDecoration: 'none',
    boxShadow: tone === 'accent' ? '0 16px 40px rgba(0,212,170,0.10)' : '0 14px 32px rgba(15,23,42,0.10)',
    opacity: disabled ? 0.55 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
  }
}

function refreshButtonStyle(loading = false): CSSProperties {
  return {
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
    opacity: loading ? 0.75 : 1,
    cursor: loading ? 'wait' : 'pointer',
  }
}

function statePanelStyle(state: CheckoutVisualState): CSSProperties {
  if (state === 'paid') {
    return {
      border: '1px solid var(--accent-glow)',
      background: 'var(--accent-dim)',
      color: 'var(--text-muted)',
    }
  }

  if (state === 'awaiting' || state === 'loading') {
    return {
      border: '1px solid var(--warn)',
      background: 'var(--warn-dim)',
      color: 'var(--text-muted)',
    }
  }

  if (state === 'error' || state === 'cancelled') {
    return {
      border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))',
      background: 'color-mix(in srgb, var(--danger-dim) 82%, transparent)',
      color: 'var(--text-muted)',
    }
  }

  return {
    border: '1px solid var(--border)',
    background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)',
    color: 'var(--text-muted)',
  }
}

async function copyToClipboard(text: string, successMessage: string, onCopied?: () => void) {
  await navigator.clipboard.writeText(text)
  toast.success(successMessage)
  onCopied?.()
}

export function CreditosCheckout() {
  const [metodo, setMetodo] = useState<MetodoAtivo>('PIX')
  const [valor, setValor] = useState('100')
  const [loading, setLoading] = useState(false)
  const [loadingPedido, setLoadingPedido] = useState(false)
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null)
  const [pedidoError, setPedidoError] = useState<CheckoutError | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)
  const lastNotifiedStatusRef = useRef<string | null>(null)

  const visualState = getVisualState(pedido, pedidoError?.message ?? null, loadingPedido && !pedido)
  const canProceed = pedido?.status === 'PAGO'
  const shouldOfferRetry = pedido?.status === 'CANCELADO' || pedido?.status === 'EXPIRADO' || Boolean(pedidoError)

  async function carregarPedido(pedidoId: string, silent = false) {
    if (!silent) setLoadingPedido(true)

    try {
      const data = await pedidosApi.detalhar(pedidoId)
      setPedido(data)
      setPedidoError(null)
      return data
    } catch {
      setPedidoError({
        title: 'Erro ao consultar o pedido',
        message: 'Não foi possível consultar o status atualizado do pedido.',
        statusCode: null,
      })
      return null
    } finally {
      if (!silent) setLoadingPedido(false)
    }
  }

  function buildRequestPayload(): IniciarPedidoRequest | null {
    const numericValue = parseFloat(valor)
    if (Number.isNaN(numericValue) || numericValue < 50) {
      toast.error('Valor mínimo: R$ 50,00')
      return null
    }

    return {
      metodo,
      valor: numericValue,
    }
  }

  async function iniciar() {
    const payload = buildRequestPayload()
    if (!payload) return

    setLoading(true)
    setPedidoError(null)
    setCopiedPix(false)
    setCopiedBoleto(false)
    lastNotifiedStatusRef.current = null

    try {
      const response = await pedidosApi.iniciar(payload)
      const normalized = normalizePedidoCriadoToDetalhe(response)
      setPedido(normalized)
      toast.success(normalized.metodo === 'PIX' ? 'Cobrança PIX gerada.' : 'Boleto gerado com sucesso.')
      await carregarPedido(normalized.id, true)
    } catch (error) {
      setPedido(null)
      const checkoutError = buildCheckoutError(error, 'Não foi possível gerar a cobrança. Tente novamente em instantes.')
      setPedidoError(checkoutError)
      toast.error(
        checkoutError.statusCode
          ? `${checkoutError.title} (${checkoutError.statusCode})`
          : checkoutError.title
      )
    } finally {
      setLoading(false)
    }
  }

  async function copiarPix(text: string) {
    await copyToClipboard(text, 'Código PIX copiado.', () => {
      setCopiedPix(true)
      window.setTimeout(() => setCopiedPix(false), 2000)
    })
  }

  async function copiarBoleto(text: string) {
    await copyToClipboard(text, 'Linha digitável copiada.', () => {
      setCopiedBoleto(true)
      window.setTimeout(() => setCopiedBoleto(false), 2000)
    })
  }

  function resetNovoPedido() {
    setPedido(null)
    setPedidoError(null)
    setCopiedPix(false)
    setCopiedBoleto(false)
    lastNotifiedStatusRef.current = null
  }

  useEffect(() => {
    if (!pedido?.id || isFinalStatus(pedido.status)) return

    const timer = window.setInterval(() => {
      carregarPedido(pedido.id, true)
    }, POLLING_INTERVAL_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [pedido?.id, pedido?.status])

  useEffect(() => {
    if (!pedido?.status) return
    if (lastNotifiedStatusRef.current === pedido.status) return

    if (pedido.status === 'PAGO') {
      toast.success('Pagamento confirmado pelo backend.')
      lastNotifiedStatusRef.current = pedido.status
      return
    }

    if (pedido.status === 'CANCELADO' || pedido.status === 'EXPIRADO') {
      toast.error(pedido.status === 'EXPIRADO' ? 'Pagamento expirado.' : 'Pagamento cancelado.')
      lastNotifiedStatusRef.current = pedido.status
    }
  }, [pedido?.status])

  const gatewayStatus = pedido ? getGatewayStatus(pedido) : null
  const gatewayStatusDetail = pedido ? getGatewayStatusDetail(pedido) : null

  return (
    <div style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Compra de créditos</CardTitle>
        </CardHeader>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ padding: '20px 22px', borderRadius: '18px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 42%, transparent))', border: '1px solid var(--accent-glow)', fontSize: '13px', lineHeight: 1.8, boxShadow: '0 16px 34px rgba(0,212,170,0.08)' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              O frontend usa apenas a API do backend. O pedido só é liberado quando o backend confirmar o pagamento via webhook.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)' }}>Método de pagamento</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }} className="credit-method-row">
              {PAYMENT_OPTIONS.map((option) => {
                const active = metodo === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMetodo(option.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                      padding: '18px 20px',
                      borderRadius: '20px',
                      border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: active ? 'linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--info-dim) 40%, transparent))' : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontFamily: 'var(--sans)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <span style={{ width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`, background: active ? 'rgba(0,212,170,0.08)' : 'color-mix(in srgb, var(--surface-2) 90%, transparent)', color: active ? 'var(--accent)' : 'var(--text-dim)' }}>
                        {option.icon}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: active ? 'var(--text)' : 'var(--text-muted)' }}>{option.label}</span>
                        <span style={{ fontSize: '11px', color: active ? 'var(--text-muted)' : 'var(--text-dim)' }}>{option.note}</span>
                      </span>
                    </span>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', flexShrink: 0, background: active ? 'var(--accent)' : 'var(--border-bright)', boxShadow: active ? '0 0 0 4px rgba(0,212,170,0.15)' : 'none' }} />
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)' }}>Valor</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['50', '100', '200', '500', '1000'].map((preset) => {
                const active = valor === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setValor(preset)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '999px',
                      border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: active ? 'var(--accent-dim)' : 'color-mix(in srgb, var(--surface-2) 88%, transparent)',
                      color: active ? 'var(--accent)' : 'var(--text-muted)',
                      fontFamily: 'var(--mono)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '3px' }}>R$</span>
                    {preset}
                  </button>
                )
              })}
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 700, color: 'var(--text-dim)', pointerEvents: 'none', userSelect: 'none' }}>R$</span>
              <input
                type="number"
                placeholder="0,00"
                value={valor}
                onChange={(event) => setValor(event.target.value)}
                min={50}
                style={{ width: '100%', paddingLeft: '48px', paddingRight: '18px', paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)', color: 'var(--text)', fontFamily: 'var(--mono)', fontSize: '18px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '-4px' }}>Valor mínimo: R$ 50,00</p>
          </div>

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
              background: loading ? 'color-mix(in srgb, var(--accent) 60%, transparent)' : 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
              color: '#041311',
              fontFamily: 'var(--sans)',
              fontSize: '15px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxShadow: '0 8px 28px rgba(0,212,170,0.22)',
            }}
          >
            {loading ? <Spinner size={16} /> : <Banknote size={18} />}
            {loading ? 'Gerando cobrança...' : `${metodo === 'PIX' ? 'Gerar pedido PIX' : 'Gerar boleto'} - ${parseFloat(valor) > 0 ? fmtMoney(valor) : '--'}`}
          </button>
        </div>
      </Card>

      {(pedido || loadingPedido || pedidoError) && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do pedido</CardTitle>
            {pedido?.id && (
              <button type="button" onClick={() => carregarPedido(pedido.id)} disabled={loadingPedido} style={refreshButtonStyle(loadingPedido)}>
                {loadingPedido ? <Spinner size={14} /> : <RefreshCw size={14} />}
                Atualizar status
              </button>
            )}
          </CardHeader>

          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loadingPedido && !pedido ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <Spinner size={16} />
                Consultando status mais recente...
              </div>
            ) : null}

            {pedido && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Pedido</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{pedido.id}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Status</div>
                    <Badge status={pedido.status} />
                  </div>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Valor</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{fmtMoney(pedido.valor)}</div>
                  </div>
                  <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Expira em</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{fmtDateTime(pedido.expira_em)}</div>
                  </div>
                  {gatewayStatus && (
                    <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Status no gateway</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{gatewayStatus}</div>
                    </div>
                  )}
                  {gatewayStatusDetail && (
                    <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Detalhe do gateway</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{gatewayStatusDetail}</div>
                    </div>
                  )}
                </div>

                <div style={{ padding: '18px', borderRadius: '16px', lineHeight: 1.7, ...statePanelStyle(visualState) }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', fontWeight: 700, color: 'var(--text)' }}>
                    {visualState === 'paid' ? <CheckCircle2 size={18} /> : visualState === 'awaiting' || visualState === 'loading' ? <RefreshCw size={18} /> : <CircleAlert size={18} />}
                    {visualState === 'paid' ? 'Pagamento confirmado' : visualState === 'awaiting' ? 'Aguardando pagamento' : visualState === 'cancelled' ? 'Pagamento indisponível' : visualState === 'error' ? 'Erro ao acompanhar pedido' : 'Status do pedido'}
                  </div>
                  {getStatusMessage(pedido)}
                </div>

                {pedido.metodo === 'PIX' && (
                  <>
                    {pedido.pix_copia_cola ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                          <QrCode size={16} />
                          PIX copia e cola
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))', borderRadius: '18px', padding: '20px', cursor: 'pointer', lineHeight: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 42px rgba(0,0,0,0.12)' }} onClick={() => void copiarPix(pedido.pix_copia_cola!)}>
                          {pedido.pix_copia_cola}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid color-mix(in srgb, var(--warn) 35%, var(--border))', background: 'color-mix(in srgb, var(--warn-dim) 82%, transparent)', color: 'var(--text-muted)', fontSize: '13px' }}>
                        O backend ainda não retornou o código PIX para este pedido.
                      </div>
                    )}

                    {resolveQrCodeSource(pedido.pix_qr_code_url) && (
                      <div style={{ display: 'grid', placeItems: 'center', gap: '12px', padding: '20px', borderRadius: '22px', border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))', background: 'radial-gradient(circle at top, color-mix(in srgb, var(--accent-dim) 46%, transparent), transparent 56%), linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 99%, transparent))', boxShadow: '0 20px 40px rgba(15,23,42,0.10)' }}>
                        <div style={{ width: '100%', maxWidth: '252px', padding: '16px', borderRadius: '24px', background: '#ffffff', boxShadow: '0 18px 36px rgba(15,23,42,0.18)' }}>
                          <img src={resolveQrCodeSource(pedido.pix_qr_code_url) ?? undefined} alt="QR Code PIX" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', borderRadius: '14px', display: 'block' }} />
                        </div>
                        <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700 }}>
                          Escaneie com o app do banco
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                      {pedido.pix_copia_cola && (
                        <button type="button" onClick={() => void copiarPix(pedido.pix_copia_cola!)} style={actionButtonStyle('accent')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copiedPix ? 'rgba(16,185,129,0.18)' : 'rgba(0,212,170,0.14)', color: copiedPix ? '#7ef3c5' : 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                              {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{copiedPix ? 'Código copiado' : 'Copiar código PIX'}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pague no banco e aguarde a confirmação oficial</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: copiedPix ? '#7ef3c5' : 'var(--accent)' }}>{copiedPix ? 'OK' : 'PIX'}</span>
                        </button>
                      )}
                    </div>
                  </>
                )}

                {pedido.metodo === 'BOLETO' && (
                  <>
                    {pedido.boleto_linha_digitavel ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                          <Landmark size={16} />
                          Linha digitável
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', border: '1px solid color-mix(in srgb, var(--info) 16%, var(--border))', borderRadius: '18px', padding: '20px', lineHeight: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 42px rgba(0,0,0,0.12)' }}>
                          {pedido.boleto_linha_digitavel}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid color-mix(in srgb, var(--warn) 35%, var(--border))', background: 'color-mix(in srgb, var(--warn-dim) 82%, transparent)', color: 'var(--text-muted)', fontSize: '13px' }}>
                        O backend ainda não retornou a linha digitável para este boleto.
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                      {pedido.boleto_linha_digitavel && (
                        <button type="button" onClick={() => void copiarBoleto(pedido.boleto_linha_digitavel!)} style={actionButtonStyle('neutral')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copiedBoleto ? 'rgba(96,165,250,0.18)' : 'color-mix(in srgb, var(--surface-2) 85%, transparent)', color: copiedBoleto ? '#93c5fd' : 'var(--info)', border: '1px solid color-mix(in srgb, var(--info) 30%, var(--border))' }}>
                              {copiedBoleto ? <Check size={16} /> : <Copy size={16} />}
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{copiedBoleto ? 'Linha copiada' : 'Copiar linha digitável'}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Use no internet banking ou repasse ao financeiro</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: copiedBoleto ? '#93c5fd' : 'var(--info)' }}>{copiedBoleto ? 'OK' : 'BOL'}</span>
                        </button>
                      )}

                      {pedido.boleto_url && (
                        <a href={pedido.boleto_url} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('accent')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                              <ExternalLink size={15} />
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir boleto</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Visualize ou baixe o título gerado pelo backend</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}><ExternalLink size={12} /></span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                {pedido.checkout_url && (
                  <div style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)', color: 'var(--text-muted)', fontSize: '13px', lineHeight: 1.7 }}>
                    Um `checkout_url` foi retornado pelo backend. O frontend o preserva apenas como compatibilidade, mas a liberação do fluxo continua dependendo do status <strong style={{ color: 'var(--text)' }}>PAGO</strong>.
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                  {pedido.checkout_url && (
                    <a href={pedido.checkout_url} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('neutral')}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                          <ExternalLink size={15} />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir checkout legado</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Opcional e sem valor para confirmar pagamento</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}><ExternalLink size={12} /></span>
                    </a>
                  )}

                  {shouldOfferRetry && (
                    <button type="button" onClick={iniciar} disabled={loading} style={actionButtonStyle('accent', loading)}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                          {loading ? <Spinner size={15} /> : <RefreshCw size={15} />}
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Gerar novo pedido</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Cria uma nova cobrança com o método atual</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>NOVO</span>
                    </button>
                  )}
                </div>

                <div style={{ padding: '18px', borderRadius: '16px', border: `1px solid ${canProceed ? 'var(--accent-glow)' : 'var(--border)'}`, background: canProceed ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 86%, transparent), color-mix(in srgb, var(--info-dim) 32%, transparent))' : 'color-mix(in srgb, var(--surface-2) 94%, transparent)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                        {canProceed ? 'Fluxo liberado para continuar' : 'Aguardando confirmação oficial'}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        {canProceed
                          ? 'O backend marcou este pedido como PAGO. Agora o restante do fluxo pode prosseguir.'
                          : 'A cobrança criada não significa pagamento concluído. O frontend continua bloqueado até o backend confirmar.'}
                      </div>
                    </div>
                    {!canProceed && (
                      <button type="button" onClick={resetNovoPedido} style={actionButtonStyle('neutral')}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                            <RefreshCw size={15} />
                          </span>
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Alterar pedido</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Voltar para ajustar método ou valor</span>
                          </span>
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>EDIT</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}

            {!pedido && pedidoError ? (
              <div style={{ padding: '16px 18px', borderRadius: '16px', border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))', background: 'color-mix(in srgb, var(--danger-dim) 82%, transparent)', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
                  <CircleAlert size={16} />
                  {pedidoError.statusCode ? `${pedidoError.title} (${pedidoError.statusCode})` : pedidoError.title}
                </div>
                <div style={{ lineHeight: 1.7 }}>{pedidoError.message}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>
                  Verifique a autenticação, os dados enviados e a resposta do backend para este pedido.
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      )}
    </div>
  )
}
