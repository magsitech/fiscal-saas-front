import { useEffect, useMemo, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Banknote, Check, Copy, ExternalLink, Landmark, MapPinHouse, QrCode, RefreshCw, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi } from '@/services/api'
import type { IniciarPedidoRequest, MetodoPagamento, PedidoDetalhe } from '@/types'
import { Badge, Card, CardHeader, CardTitle, Input, Spinner } from '@/components/ui'
const POLLING_INTERVAL_MS = 5000

type MetodoAtivo = Extract<MetodoPagamento, 'PIX' | 'BOLETO'>

type BoletoFormState = {
  payer_zip_code: string
  payer_street_name: string
  payer_street_number: string
  payer_neighborhood: string
  payer_city: string
  payer_federal_unit: string
}

const PAYMENT_OPTIONS: Array<{ id: MetodoAtivo; label: string; note: string; icon: React.ReactNode }> = [
  { id: 'PIX', label: 'PIX', note: 'Geração imediata com copia e cola e QR Code.', icon: <Sparkles size={16} /> },
  { id: 'BOLETO', label: 'Boleto bancário', note: 'Gere o pedido com os dados do pagador.', icon: <Landmark size={16} /> },
]

const EMPTY_BOLETO_FORM: BoletoFormState = {
  payer_zip_code: '',
  payer_street_name: '',
  payer_street_number: '',
  payer_neighborhood: '',
  payer_city: '',
  payer_federal_unit: '',
}

function fmtMoney(value: string | number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '--'
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return '--'
  return format(parseISO(iso), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

function isContinuable(status: string) {
  return status === 'AGUARDANDO_PAGAMENTO'
}

function isFinalStatus(status: string) {
  return status === 'PAGO' || status === 'CANCELADO' || status === 'EXPIRADO'
}

function actionButtonStyle(tone: 'accent' | 'neutral' = 'accent', disabled = false): React.CSSProperties {
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

function normalizePedidoCriadoToDetalhe(response: Awaited<ReturnType<typeof pedidosApi.iniciar>>): PedidoDetalhe {
  return {
    id: response.pedido_id,
    metodo: response.metodo,
    valor: response.valor,
    status: response.status,
    mp_status: response.mp_status ?? null,
    mp_status_detail: response.mp_status_detail ?? null,
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
  }
}

function getStatusMessage(pedido: PedidoDetalhe) {
  if (pedido.status === 'PAGO') return 'Pagamento confirmado. O saldo será refletido conforme a confirmação oficial do backend.'
  if (pedido.status === 'AGUARDANDO_PAGAMENTO') return 'Pedido aguardando pagamento. Use os dados abaixo para concluir a transação.'
  if (pedido.status === 'CANCELADO') return 'Pedido cancelado. O fluxo de pagamento foi encerrado.'
  if (pedido.status === 'EXPIRADO') return 'Pedido expirado. Gere um novo pedido para continuar.'
  return 'Pedido criado e aguardando atualização de status pelo backend.'
}


function isQrImageSource(value?: string | null) {
  return typeof value === 'string' && (value.startsWith('data:image') || value.startsWith('http'))
}

function resolveQrCodeSource(value?: string | null) {
  if (!value) return null
  if (isQrImageSource(value)) return value
  return `data:image/png;base64,${value}`
}

function refreshButtonStyle(loading = false): React.CSSProperties {
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

export function CreditosCheckout() {
  const [metodo, setMetodo] = useState<MetodoAtivo>('PIX')
  const [valor, setValor] = useState('100')
  const [boletoForm, setBoletoForm] = useState<BoletoFormState>(EMPTY_BOLETO_FORM)
  const [loading, setLoading] = useState(false)
  const [loadingPedido, setLoadingPedido] = useState(false)
  const [pedido, setPedido] = useState<PedidoDetalhe | null>(null)
  const [pedidoError, setPedidoError] = useState<string | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)

  const shouldShowBoletoForm = metodo === 'BOLETO'
  const canContinue = Boolean(pedido?.checkout_url) && Boolean(pedido && isContinuable(pedido.status))
  const boletoMissingFields = useMemo(() => {
    if (!shouldShowBoletoForm) return []
    return Object.entries(boletoForm)
      .filter(([, fieldValue]) => !fieldValue.trim())
      .map(([key]) => key)
  }, [boletoForm, shouldShowBoletoForm])

  function updateBoletoField(field: keyof BoletoFormState, fieldValue: string) {
    setBoletoForm((current) => ({
      ...current,
      [field]: field === 'payer_federal_unit' ? fieldValue.toUpperCase().slice(0, 2) : fieldValue,
    }))
  }

  async function carregarPedido(pedidoId: string, silent = false) {
    if (!silent) setLoadingPedido(true)
    try {
      const data = await pedidosApi.detalhar(pedidoId)
      setPedido(data)
      setPedidoError(null)
      return data
    } catch {
      setPedidoError('Não foi possível carregar o pedido.')
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

    if (metodo === 'BOLETO' && boletoMissingFields.length > 0) {
      toast.error('Preencha os dados do pagador para gerar o boleto.')
      return null
    }

    return {
      metodo,
      valor: numericValue,
      ...(metodo === 'BOLETO' ? boletoForm : {}),
    }
  }

  async function iniciar() {
    const payload = buildRequestPayload()
    if (!payload) return

    setLoading(true)
    setPedidoError(null)
    try {
      const response = await pedidosApi.iniciar(payload)
      const normalized = normalizePedidoCriadoToDetalhe(response)
      setPedido(normalized)
      toast.success('Pedido gerado com sucesso!')
      await carregarPedido(normalized.id, true)
    } catch {
      toast.error('Erro ao gerar pedido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  function copiar(text: string, onCopied?: () => void) {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copiado!')
      onCopied?.()
    })
  }

  function copiarPix(text: string) {
    copiar(text, () => {
      setCopiedPix(true)
      setTimeout(() => setCopiedPix(false), 2000)
    })
  }

  function copiarBoleto(text: string) {
    copiar(text, () => {
      setCopiedBoleto(true)
      setTimeout(() => setCopiedBoleto(false), 2000)
    })
  }

  useEffect(() => {
    setPedido(null)
    setPedidoError(null)
    setCopiedPix(false)
    setCopiedBoleto(false)
  }, [])

  useEffect(() => {
    if (!pedido?.id || isFinalStatus(pedido.status)) return

    const timer = window.setInterval(() => {
      carregarPedido(pedido.id, true)
    }, POLLING_INTERVAL_MS)

    return () => {
      window.clearInterval(timer)
    }
  }, [pedido?.id, pedido?.status])

  return (
    <div style={{ maxWidth: '860px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Compra de créditos</CardTitle>
        </CardHeader>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{ padding: '20px 22px', borderRadius: '18px', background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-dim) 88%, transparent), color-mix(in srgb, var(--info-dim) 42%, transparent))', border: '1px solid var(--accent-glow)', fontSize: '13px', lineHeight: 1.8, boxShadow: '0 16px 34px rgba(0,212,170,0.08)' }}>
            <span style={{ color: 'var(--text-muted)' }}>
              Gere seu pedido por PIX ou boleto e acompanhe tudo por aqui. Assim que o checkout estiver disponível, você poderá concluir o pagamento com segurança.
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

          {shouldShowBoletoForm && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)' }}>
                <MapPinHouse size={14} />
                Dados do pagador para boleto
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                <Input label="CEP" value={boletoForm.payer_zip_code} onChange={(event) => updateBoletoField('payer_zip_code', event.target.value)} />
                <Input label="Rua" value={boletoForm.payer_street_name} onChange={(event) => updateBoletoField('payer_street_name', event.target.value)} />
                <Input label="Número" value={boletoForm.payer_street_number} onChange={(event) => updateBoletoField('payer_street_number', event.target.value)} />
                <Input label="Bairro" value={boletoForm.payer_neighborhood} onChange={(event) => updateBoletoField('payer_neighborhood', event.target.value)} />
                <Input label="Cidade" value={boletoForm.payer_city} onChange={(event) => updateBoletoField('payer_city', event.target.value)} />
                <Input label="UF" maxLength={2} value={boletoForm.payer_federal_unit} onChange={(event) => updateBoletoField('payer_federal_unit', event.target.value)} />
              </div>
            </div>
          )}

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
            {loading ? 'Processando...' : `${metodo === 'PIX' ? 'Gerar pedido PIX' : 'Gerar boleto'} - ${parseFloat(valor) > 0 ? fmtMoney(valor) : '--'}`}
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
                Atualizando pedido...
              </div>
            ) : null}

            {pedidoError ? (
              <div style={{ padding: '14px 16px', borderRadius: '14px', border: '1px solid color-mix(in srgb, var(--danger) 30%, var(--border))', background: 'color-mix(in srgb, var(--danger-dim) 82%, transparent)', color: 'var(--text-muted)', fontSize: '13px' }}>
                {pedidoError}
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
                </div>

                <div style={{ padding: '18px', borderRadius: '16px', border: `1px solid ${pedido.status === 'PAGO' ? 'var(--accent-glow)' : pedido.status === 'AGUARDANDO_PAGAMENTO' ? 'var(--warn)' : 'var(--border)'}`, background: pedido.status === 'PAGO' ? 'var(--accent-dim)' : pedido.status === 'AGUARDANDO_PAGAMENTO' ? 'var(--warn-dim)' : 'color-mix(in srgb, var(--surface-2) 94%, transparent)', fontSize: '13px', lineHeight: 1.7, color: 'var(--text-muted)' }}>
                  {getStatusMessage(pedido)}
                </div>

                {pedido.metodo === 'PIX' && pedido.pix_copia_cola && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                      <QrCode size={16} />
                      PIX copia e cola
                    </div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))', borderRadius: '18px', padding: '20px', cursor: 'pointer', lineHeight: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 42px rgba(0,0,0,0.12)' }} onClick={() => copiarPix(pedido.pix_copia_cola!)}>
                      {pedido.pix_copia_cola}
                    </div>

                    {resolveQrCodeSource(pedido.pix_qr_code_url) && (
                      <div style={{ display: 'grid', placeItems: 'center', gap: '12px', padding: '20px', borderRadius: '22px', border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))', background: 'radial-gradient(circle at top, color-mix(in srgb, var(--accent-dim) 46%, transparent), transparent 56%), linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 99%, transparent))', boxShadow: '0 20px 40px rgba(15,23,42,0.10)' }}>
                        <div style={{ width: '100%', maxWidth: '252px', padding: '16px', borderRadius: '24px', background: '#ffffff', boxShadow: '0 18px 36px rgba(15,23,42,0.18)' }}>
                          <img src={resolveQrCodeSource(pedido.pix_qr_code_url)!} alt="QR Code PIX" style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'contain', borderRadius: '14px', display: 'block' }} />
                        </div>
                        <div style={{ fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700 }}>
                          Escaneie com o app do banco
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                      <button type="button" onClick={() => copiarPix(pedido.pix_copia_cola!)} style={actionButtonStyle('accent')}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copiedPix ? 'rgba(16,185,129,0.18)' : 'rgba(0,212,170,0.14)', color: copiedPix ? '#7ef3c5' : 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                            {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                          </span>
                          <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{copiedPix ? 'Código copiado' : 'Copiar código PIX'}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Use no app do banco ou escaneie o QR Code</span>
                          </span>
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: copiedPix ? '#7ef3c5' : 'var(--accent)' }}>{copiedPix ? 'OK' : 'PIX'}</span>
                      </button>

                      {pedido.checkout_url && (
                        <a href={pedido.checkout_url} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('neutral', !canContinue)}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                              <ExternalLink size={15} />
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Concluir transação</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Abrir checkout de pagamento</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}><ExternalLink size={12} /></span>
                        </a>
                      )}
                    </div>
                  </>
                )}

                {pedido.metodo === 'BOLETO' && (
                  <>
                    {pedido.boleto_linha_digitavel && (
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '12px', wordBreak: 'break-all', color: 'var(--text-muted)', background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))', border: '1px solid color-mix(in srgb, var(--info) 16%, var(--border))', borderRadius: '18px', padding: '20px', lineHeight: 1.8, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 42px rgba(0,0,0,0.12)' }}>
                        {pedido.boleto_linha_digitavel}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                      {pedido.boleto_linha_digitavel && (
                        <button type="button" onClick={() => copiarBoleto(pedido.boleto_linha_digitavel!)} style={actionButtonStyle('neutral')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: copiedBoleto ? 'rgba(96,165,250,0.18)' : 'color-mix(in srgb, var(--surface-2) 85%, transparent)', color: copiedBoleto ? '#93c5fd' : 'var(--info)', border: '1px solid color-mix(in srgb, var(--info) 30%, var(--border))' }}>
                              {copiedBoleto ? <Check size={16} /> : <Copy size={16} />}
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>{copiedBoleto ? 'Linha copiada' : 'Copiar linha digitável'}</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Compartilhe com o financeiro ou pague no banco</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: copiedBoleto ? '#93c5fd' : 'var(--info)' }}>{copiedBoleto ? 'OK' : 'BOL'}</span>
                        </button>
                      )}

                      {pedido.checkout_url && (
                        <a href={pedido.checkout_url} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('accent', !canContinue)}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,212,170,0.14)', color: 'var(--accent)', border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)' }}>
                              <ExternalLink size={15} />
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Concluir transação</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Abrir checkout de pagamento</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}><ExternalLink size={12} /></span>
                        </a>
                      )}

                      {pedido.boleto_url && (
                        <a href={pedido.boleto_url} target="_blank" rel="noopener noreferrer" style={actionButtonStyle('neutral')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <span style={{ width: '34px', height: '34px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)', color: 'var(--text)', border: '1px solid var(--border)' }}>
                              <ExternalLink size={15} />
                            </span>
                            <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir boleto</span>
                              <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Visualizar título emitido</span>
                            </span>
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>WEB</span>
                        </a>
                      )}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
