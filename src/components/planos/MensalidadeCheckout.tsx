import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import axios from 'axios'
import {
  Banknote,
  Check,
  CheckCircle2,
  CircleAlert,
  Copy,
  CreditCard,
  ExternalLink,
  Landmark,
  QrCode,
  RefreshCw,
  Sparkles,
  TestTube,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi, planosApi } from '@/services/api'
import { APP_ENV } from '@/config/runtime'
import type {
  AssinaturaResumo,
  IniciarPedidoRequest,
  MetodoPagamento,
  PedidoDetalhe,
  TipoPlano,
} from '@/types'
import { Card, CardHeader, CardTitle, Spinner } from '@/components/ui'

const POLLING_INTERVAL_MS = 5000

type MetodoAtivo = Extract<MetodoPagamento, 'PIX' | 'BOLETO' | 'CARTAO'>
type CheckoutError = { title: string; message: string; statusCode?: number | null }

const PAYMENT_OPTIONS: Array<{ id: MetodoAtivo; label: string; note: string; icon: ReactNode }> = [
  { id: 'PIX', label: 'PIX', note: 'Código PIX e QR Code disponíveis na hora.', icon: <Sparkles size={16} /> },
  { id: 'BOLETO', label: 'Boleto bancário', note: 'Boleto pronto para abrir e finalizar o pagamento.', icon: <Landmark size={16} /> },
  { id: 'CARTAO', label: 'Cartão de crédito', note: 'Pagamento em ambiente seguro da AbacatePay.', icon: <CreditCard size={16} /> },
]

function fmtMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function isFinalStatus(status: string) {
  return status === 'PAGO' || status === 'CANCELADO' || status === 'EXPIRADO'
}

function normalizePedidoCriadoToDetalhe(
  response: Awaited<ReturnType<typeof pedidosApi.iniciar>>,
): PedidoDetalhe {
  return {
    id: response.pedido_id,
    tipo: 'MENSALIDADE',
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

function isQrImageSource(value?: string | null) {
  return typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))
}

function resolveQrCodeSource(value?: string | null) {
  if (!value) return null
  const normalized = value.trim()
  if (!normalized) return null
  if (isQrImageSource(normalized)) return normalized
  if (normalized.startsWith('<svg')) return `data:image/svg+xml;utf8,${encodeURIComponent(normalized)}`
  return `data:image/png;base64,${normalized}`
}

function getBoletoPaymentUrl(pedido: Pick<PedidoDetalhe, 'checkout_url' | 'boleto_url'>) {
  return pedido.checkout_url?.trim() || pedido.boleto_url?.trim() || null
}

function buildCheckoutError(error: unknown, fallback: string): CheckoutError {
  if (!axios.isAxiosError(error)) return { title: 'Erro ao gerar pagamento', message: fallback, statusCode: null }
  const statusCode = error.response?.status ?? null
  const payload = error.response?.data
  if (typeof payload === 'string' && payload.trim()) return { title: 'Falha ao criar o pedido', message: payload, statusCode }
  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>
    const msg = record.detail ?? record.message ?? record.mensagem
    if (typeof msg === 'string' && msg.trim()) return { title: 'Falha ao criar o pedido', message: msg, statusCode }
    if (statusCode === 409) {
      return { title: 'Pedido já existente', message: String(msg ?? 'Este pedido já foi processado.'), statusCode }
    }
  }
  if (statusCode === 402) return { title: 'Pagamento necessário', message: 'Não foi possível processar o pagamento.', statusCode }
  if (statusCode === 422) return { title: 'Erro de validação', message: 'Dados inválidos para criar o pedido.', statusCode }
  if (statusCode && statusCode >= 500) return { title: 'Instabilidade no servidor', message: 'Tente novamente em instantes.', statusCode }
  return { title: 'Erro ao gerar pagamento', message: fallback, statusCode }
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
    background:
      tone === 'accent'
        ? 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 56%, transparent))'
        : 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))',
    color: tone === 'accent' ? 'var(--text)' : 'var(--text-muted)',
    textDecoration: 'none',
    boxShadow: tone === 'accent' ? '0 16px 40px rgba(0,212,170,0.10)' : '0 14px 32px rgba(15,23,42,0.10)',
    opacity: disabled ? 0.55 : 1,
    pointerEvents: disabled ? 'none' : 'auto',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }
}

async function copyToClipboard(text: string, msg: string, onCopied?: () => void) {
  await navigator.clipboard.writeText(text)
  toast.success(msg)
  onCopied?.()
}

interface Props {
  plano: TipoPlano
  valor: number
  sandbox: boolean
  onSuccess: (assinatura: AssinaturaResumo) => void
}

export function MensalidadeCheckout({ plano, valor, sandbox, onSuccess }: Props) {
  const [metodo, setMetodo] = useState<MetodoAtivo>('PIX')
  const [loading, setLoading] = useState(false)
  const [loadingPedido, setLoadingPedido] = useState(false)
  const [loadingAtivacao, setLoadingAtivacao] = useState(false)
  const [loadingSimulacao, setLoadingSimulacao] = useState(false)
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null)
  const [pedidoError, setPedidoError] = useState<CheckoutError | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)
  const lastNotifiedStatusRef = useRef<string | null>(null)
  const activationTriedRef = useRef(false)

  const canProceed = pedido?.status === 'PAGO'
  const shouldOfferRetry =
    pedido?.status === 'CANCELADO' || pedido?.status === 'EXPIRADO' || Boolean(pedidoError)

  const pixQrSource = pedido?.metodo === 'PIX' ? resolveQrCodeSource(pedido.pix_qr_code_url) : null
  const pixCodeAvailable = Boolean(pedido?.metodo === 'PIX' && pedido.pix_copia_cola?.trim())
  const boletoPaymentUrl = pedido?.metodo === 'BOLETO' ? getBoletoPaymentUrl(pedido) : null
  const shouldLogDebug = import.meta.env.DEV || APP_ENV === 'staging'

  async function carregarPedido(pedidoId: string, silent = false) {
    if (!silent) setLoadingPedido(true)
    try {
      const data = await pedidosApi.detalhar(pedidoId)
      setPedido(data)
      setPedidoError(null)
      return data
    } catch (error) {
      const e = buildCheckoutError(error, 'Não foi possível consultar o status do pedido.')
      if (!silent) setPedidoError(e)
      return null
    } finally {
      if (!silent) setLoadingPedido(false)
    }
  }

  async function ativarPlano(pedidoId: string) {
    if (activationTriedRef.current) return
    activationTriedRef.current = true
    setLoadingAtivacao(true)
    try {
      const assinatura = await planosApi.ativar({ plano, pedido_id: pedidoId })
      toast.success('Plano ativado com sucesso!')
      onSuccess(assinatura)
    } catch (error) {
      const e = buildCheckoutError(error, 'Pagamento confirmado, mas não foi possível ativar o plano. Entre em contato com o suporte.')
      if (shouldLogDebug) console.error('[plano] Falha ao ativar plano', error)
      toast.error(e.message)
      setPedidoError(e)
    } finally {
      setLoadingAtivacao(false)
    }
  }

  async function iniciar() {
    setLoading(true)
    setPedidoError(null)
    setCopiedPix(false)
    setCopiedBoleto(false)
    lastNotifiedStatusRef.current = null
    activationTriedRef.current = false

    const payload: IniciarPedidoRequest = {
      metodo,
      valor,
      tipo: 'MENSALIDADE',
      descricao: `Mensalidade plano ${plano}`,
    }

    try {
      const response = await pedidosApi.iniciar(payload)
      const normalized = normalizePedidoCriadoToDetalhe(response)
      setPedido(normalized)
      if (metodo === 'PIX') {
        toast.success('Pagamento PIX gerado.')
        await carregarPedido(normalized.id, true)
      } else if (metodo === 'BOLETO') {
        toast.success('Boleto gerado com sucesso.')
      } else {
        if (!normalized.checkout_url) {
          setPedidoError({ title: 'Link de pagamento indisponível', message: 'Não foi possível gerar o link de pagamento. Tente novamente.', statusCode: null })
          toast.error('Link de pagamento indisponível.')
          return
        }
        toast.success('Pagamento com cartão gerado.')
      }
    } catch (error) {
      if (shouldLogDebug) console.error('[mensalidade] Falha ao iniciar pedido', error)
      setPedido(null)
      const e = buildCheckoutError(error, 'Não foi possível gerar o pagamento. Tente novamente.')
      setPedidoError(e)
      toast.error(e.statusCode ? `${e.title} (${e.statusCode})` : e.title)
    } finally {
      setLoading(false)
    }
  }

  async function simularPagamento() {
    if (!pedido?.id) return
    setLoadingSimulacao(true)
    try {
      const updated = await pedidosApi.simularPagamento(pedido.id)
      setPedido(updated)
      toast.success('Pagamento simulado.')
    } catch {
      toast.error('Falha ao simular pagamento.')
    } finally {
      setLoadingSimulacao(false)
    }
  }

  function resetNovoPedido() {
    setPedido(null)
    setPedidoError(null)
    setCopiedPix(false)
    setCopiedBoleto(false)
    lastNotifiedStatusRef.current = null
    activationTriedRef.current = false
  }

  useEffect(() => {
    if (!pedido?.id || isFinalStatus(pedido.status)) return
    const timer = window.setInterval(() => { carregarPedido(pedido.id, true) }, POLLING_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [pedido?.id, pedido?.status])

  useEffect(() => {
    if (!pedido?.status) return
    if (lastNotifiedStatusRef.current === pedido.status) return
    lastNotifiedStatusRef.current = pedido.status
    if (pedido.status === 'PAGO') {
      ativarPlano(pedido.id)
    } else if (pedido.status === 'CANCELADO' || pedido.status === 'EXPIRADO') {
      toast.error(pedido.status === 'EXPIRADO' ? 'Pagamento expirado.' : 'Pagamento cancelado.')
    }
  }, [pedido?.status])

  if (canProceed && loadingAtivacao) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '20px 24px', borderRadius: '18px', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', color: 'var(--text)', fontSize: '14px', fontWeight: 600 }}>
        <Spinner size={18} />
        Ativando plano...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Sandbox banner */}
      {sandbox && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px', borderRadius: '12px', background: 'color-mix(in srgb, var(--warn) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--warn) 30%, var(--border))', fontSize: '13px', color: 'var(--warn, #ca8a04)' }}>
          <TestTube size={15} style={{ flexShrink: 0 }} />
          <span><strong>Ambiente de testes.</strong> Os pagamentos não são reais.</span>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Pagamento da mensalidade</CardTitle>
        </CardHeader>

        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Resumo do plano */}
          <div style={{ padding: '18px 20px', borderRadius: '16px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 80%, transparent), transparent)', border: '1px solid var(--accent-glow)', fontSize: '13px', lineHeight: 1.8 }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text)', marginBottom: '4px' }}>
              {fmtMoney(valor)}<span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>/mês</span>
            </div>
            <div style={{ color: 'var(--text-muted)' }}>
              Após o pagamento, o plano é ativado automaticamente na sua conta.
            </div>
          </div>

          {/* Método */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)' }}>
              Método de pagamento
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="credit-method-row">
              {PAYMENT_OPTIONS.map((option) => {
                const active = metodo === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setMetodo(option.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      gap: '12px', padding: '18px 20px', borderRadius: '20px',
                      border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: active
                        ? 'linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--info-dim) 40%, transparent))'
                        : 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                      cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--sans)',
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
                      <span style={{
                        width: '42px', height: '42px', borderRadius: '14px', flexShrink: 0,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px solid ${active ? 'var(--accent-glow)' : 'var(--border)'}`,
                        background: active ? 'rgba(0,212,170,0.08)' : 'color-mix(in srgb, var(--surface-2) 90%, transparent)',
                        color: active ? 'var(--accent)' : 'var(--text-dim)',
                      }}>
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

          {/* Gerar pagamento */}
          <button
            type="button"
            onClick={iniciar}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '10px', padding: '18px 24px', borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.14)',
              background: loading
                ? 'color-mix(in srgb, var(--accent) 60%, transparent)'
                : 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
              color: '#041311', fontFamily: 'var(--sans)', fontSize: '15px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
              boxShadow: '0 8px 28px rgba(0,212,170,0.22)',
            }}
          >
            {loading ? <Spinner size={16} /> : <Banknote size={18} />}
            {loading ? 'Gerando pagamento...' : `Pagar ${fmtMoney(valor)} via ${metodo === 'PIX' ? 'PIX' : metodo === 'BOLETO' ? 'Boleto' : 'Cartão'}`}
          </button>
        </div>
      </Card>

      {/* Resultado do pedido */}
      {(pedido || loadingPedido || pedidoError) && (
        <Card>
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {loadingPedido && !pedido && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)' }}>
                <Spinner size={16} />Consultando status...
              </div>
            )}

            {pedido && (
              <>
                {/* Status badge */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)' }}>
                    Status do pedido
                  </div>
                  <span style={{
                    padding: '4px 14px', borderRadius: '999px', fontSize: '12px', fontWeight: 700,
                    background: pedido.status === 'PAGO' ? 'var(--accent-dim)' : pedido.status === 'AGUARDANDO_PAGAMENTO' ? 'color-mix(in srgb, var(--info) 12%, transparent)' : 'color-mix(in srgb, var(--warn) 12%, transparent)',
                    color: pedido.status === 'PAGO' ? 'var(--accent)' : pedido.status === 'AGUARDANDO_PAGAMENTO' ? 'var(--info)' : 'var(--warn)',
                    border: `1px solid ${pedido.status === 'PAGO' ? 'var(--accent-glow)' : 'color-mix(in srgb, var(--border) 80%, transparent)'}`,
                  }}>
                    {pedido.status === 'PAGO' ? 'Pago' : pedido.status === 'AGUARDANDO_PAGAMENTO' ? 'Aguardando pagamento' : pedido.status === 'EXPIRADO' ? 'Expirado' : pedido.status === 'CANCELADO' ? 'Cancelado' : pedido.status}
                  </span>
                </div>

                {pedidoError && (
                  <div style={{ padding: '16px 18px', borderRadius: '16px', border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))', background: 'color-mix(in srgb, var(--danger-dim) 82%, transparent)', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
                      <CircleAlert size={16} />
                      {pedidoError.statusCode ? `${pedidoError.title} (${pedidoError.statusCode})` : pedidoError.title}
                    </div>
                    <div style={{ lineHeight: 1.7 }}>{pedidoError.message}</div>
                  </div>
                )}

                {/* PIX */}
                {pedido.metodo === 'PIX' && (
                  <>
                    {pixQrSource && (
                      <div style={{ display: 'grid', placeItems: 'center', gap: '12px', padding: '20px', borderRadius: '22px', border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))', background: 'radial-gradient(circle at top, color-mix(in srgb, var(--accent-dim) 46%, transparent), transparent 56%)' }}>
                        <div style={{ width: '100%', maxWidth: '220px', padding: '14px', borderRadius: '20px', background: '#ffffff', boxShadow: '0 16px 32px rgba(15,23,42,0.16)' }}>
                          <img src={pixQrSource} alt="QR Code PIX" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', borderRadius: '12px', display: 'block' }} />
                        </div>
                      </div>
                    )}
                    {pixCodeAvailable && pedido.pix_copia_cola && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                          <QrCode size={16} />PIX copia e cola
                        </div>
                        <div
                          style={{ fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 45%, var(--border))', borderRadius: '16px', padding: '18px', cursor: 'pointer', lineHeight: 1.8 }}
                          onClick={() => void copyToClipboard(pedido.pix_copia_cola!, 'Código PIX copiado.', () => { setCopiedPix(true); window.setTimeout(() => setCopiedPix(false), 2000) })}
                        >
                          {pedido.pix_copia_cola}
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button type="button" onClick={() => void copyToClipboard(pedido.pix_copia_cola!, 'Código PIX copiado.', () => { setCopiedPix(true); window.setTimeout(() => setCopiedPix(false), 2000) })} style={actionButtonStyle('accent')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copiedPix ? 'rgba(16,185,129,0.18)' : 'rgba(0,212,170,0.14)', color: copiedPix ? '#7ef3c5' : 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                                {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{copiedPix ? 'Código copiado' : 'Copiar código PIX'}</span>
                            </span>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: copiedPix ? '#7ef3c5' : 'var(--accent)' }}>{copiedPix ? 'OK' : 'PIX'}</span>
                          </button>
                        </div>
                      </>
                    )}
                  </>
                )}

                {/* Boleto */}
                {pedido.metodo === 'BOLETO' && (
                  <>
                    {pedido.boleto_linha_digitavel && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                          <Landmark size={16} />Linha digitável
                        </div>
                        <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', lineHeight: 1.8 }}>
                          {pedido.boleto_linha_digitavel}
                        </div>
                      </>
                    )}
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {pedido.boleto_linha_digitavel && (
                        <button type="button" onClick={() => void copyToClipboard(pedido.boleto_linha_digitavel!, 'Linha digitável copiada.', () => { setCopiedBoleto(true); window.setTimeout(() => setCopiedBoleto(false), 2000) })} style={actionButtonStyle('neutral')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copiedBoleto ? 'rgba(96,165,250,0.18)' : 'color-mix(in srgb, var(--surface-2) 85%, transparent)', color: copiedBoleto ? '#93c5fd' : 'var(--info)', border: '1px solid color-mix(in srgb, var(--info) 30%, var(--border))' }}>
                              {copiedBoleto ? <Check size={16} /> : <Copy size={16} />}
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{copiedBoleto ? 'Linha copiada' : 'Copiar linha digitável'}</span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: copiedBoleto ? '#93c5fd' : 'var(--info)' }}>{copiedBoleto ? 'OK' : 'BOL'}</span>
                        </button>
                      )}
                      {boletoPaymentUrl && (
                        <a href={boletoPaymentUrl} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('accent')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                              <ExternalLink size={15} />
                            </span>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir boleto</span>
                          </span>
                          <ExternalLink size={12} style={{ color: 'var(--accent)' }} />
                        </a>
                      )}
                    </div>
                  </>
                )}

                {/* Cartão */}
                {pedido.metodo === 'CARTAO' && pedido.checkout_url && (
                  <a href={pedido.checkout_url} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('accent')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                        <ExternalLink size={15} />
                      </span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Ir para o pagamento seguro</span>
                    </span>
                    <ExternalLink size={12} style={{ color: 'var(--accent)' }} />
                  </a>
                )}

                {/* Sandbox: simular pagamento */}
                {sandbox && !isFinalStatus(pedido.status) && (
                  <button type="button" onClick={simularPagamento} disabled={loadingSimulacao} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', border: '1px dashed color-mix(in srgb, var(--warn) 50%, var(--border))', background: 'color-mix(in srgb, var(--warn) 8%, transparent)', color: 'var(--warn, #ca8a04)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 600, cursor: loadingSimulacao ? 'not-allowed' : 'pointer', opacity: loadingSimulacao ? 0.6 : 1 }}>
                    {loadingSimulacao ? <Spinner size={14} /> : <TestTube size={14} />}
                    Simular pagamento (sandbox)
                  </button>
                )}

                {/* Retry */}
                {shouldOfferRetry && (
                  <button type="button" onClick={resetNovoPedido} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px 20px', borderRadius: '14px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 90%, transparent)', color: 'var(--text-muted)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                    <RefreshCw size={14} />
                    Tentar novamente
                  </button>
                )}
              </>
            )}

            {!pedido && pedidoError && (
              <div style={{ padding: '16px 18px', borderRadius: '16px', border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))', background: 'color-mix(in srgb, var(--danger-dim) 82%, transparent)', color: 'var(--text-muted)', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text)', fontWeight: 700 }}>
                  <CircleAlert size={16} />
                  {pedidoError.statusCode ? `${pedidoError.title} (${pedidoError.statusCode})` : pedidoError.title}
                </div>
                <div style={{ lineHeight: 1.7 }}>{pedidoError.message}</div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Confirmado */}
      {canProceed && !loadingAtivacao && (
        <div style={{ padding: '20px 24px', borderRadius: '18px', border: '1px solid var(--accent-glow)', background: 'linear-gradient(135deg, var(--accent-dim), color-mix(in srgb, var(--info-dim) 40%, transparent))', display: 'flex', alignItems: 'center', gap: '14px' }}>
          <CheckCircle2 size={22} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '2px' }}>Pagamento confirmado</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Seu plano foi ativado e já está disponível.</div>
          </div>
        </div>
      )}
    </div>
  )
}
