import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Banknote, Check, Copy, CreditCard, ExternalLink, Landmark, QrCode, Sparkles } from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi } from '@/services/api'
import type { IniciarPedidoResponse } from '@/types'
import { Badge, Card, CardHeader, CardTitle, Spinner } from '@/components/ui'

type MetodoCredito = 'PIX' | 'BOLETO' | 'CARTAO'

type ResultadoCredito = {
  metodo: MetodoCredito
  pedidoId: string
  status: string
  valor: string
  expiraEm?: string | null
  pix?: string
  pixQrCodeUrl?: string
  boleto?: string
  boletoUrl?: string
  checkoutUrl?: string
  subscriptionId?: string | null
  payload?: Record<string, unknown> | null
}

const PAYMENT_OPTIONS: Array<{
  id: MetodoCredito
  label: string
  note: string
  icon: React.ReactNode
}> = [
  {
    id: 'PIX',
    label: 'PIX',
    note: 'Confirmação rápida e crédito liberado após pagamento.',
    icon: <Sparkles size={16} />,
  },
  {
    id: 'BOLETO',
    label: 'Boleto bancário',
    note: 'Fluxo ideal para financeiro corporativo e conciliação.',
    icon: <Landmark size={16} />,
  },
  {
    id: 'CARTAO',
    label: 'Cartão recorrente',
    note: 'Assinatura mensal com fluxo seguro do Mercado Pago.',
    icon: <CreditCard size={16} />,
  },
]

function parseGatewayPayload(payload?: string | null) {
  if (!payload) return null
  try {
    const parsed = JSON.parse(payload) as unknown
    return parsed && typeof parsed === 'object' ? parsed as Record<string, unknown> : null
  } catch {
    return null
  }
}

function pickGatewayValue(payload: Record<string, unknown> | null, keys: string[]) {
  if (!payload) return undefined
  for (const key of keys) {
    const value = payload[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return undefined
}

function fmtMoney(value: string | number) {
  const numeric = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(numeric)) return '—'
  return numeric.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function fmtDateTime(iso?: string | null) {
  if (!iso) return '—'
  return format(parseISO(iso), 'dd/MM/yyyy HH:mm', { locale: ptBR })
}

function actionButtonStyle(tone: 'accent' | 'neutral' = 'accent'): React.CSSProperties {
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
  }
}

function normalizeResultado(response: IniciarPedidoResponse): ResultadoCredito {
  const payload = parseGatewayPayload(response.gateway_payload)
  const checkoutUrl = response.checkout_url
    ?? response.redirect_url
    ?? response.init_point
    ?? pickGatewayValue(payload, [
      'checkout_url',
      'checkoutUrl',
      'redirect_url',
      'redirectUrl',
      'init_point',
      'initPoint',
      'payment_url',
      'paymentUrl',
    ])

  return {
    metodo: response.metodo_pagamento,
    pedidoId: response.pedido_id,
    status: response.status,
    valor: response.valor,
    expiraEm: response.expira_em,
    pix: response.pix_copia_cola,
    pixQrCodeUrl: response.pix_qr_code_url,
    boleto: response.boleto_linha_digitavel,
    boletoUrl: response.boleto_url,
    checkoutUrl,
    subscriptionId: response.subscription_id ?? pickGatewayValue(payload, ['subscription_id', 'subscriptionId', 'preapproval_id']),
    payload,
  }
}

export function CreditosCheckout() {
  const [metodo, setMetodo] = useState<MetodoCredito>('PIX')
  const [valor, setValor] = useState('100')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState<ResultadoCredito | null>(null)
  const [copiedPix, setCopiedPix] = useState(false)
  const [copiedBoleto, setCopiedBoleto] = useState(false)

  async function iniciar() {
    const v = parseFloat(valor)
    if (isNaN(v) || v < 50) return toast.error('Valor mínimo: R$ 50,00')
    setLoading(true)
    setResultado(null)
    try {
      const response = await pedidosApi.iniciar(metodo, v)
      setResultado(normalizeResultado(response))
      toast.success(metodo === 'CARTAO' ? 'Fluxo recorrente iniciado com sucesso.' : 'Pedido gerado com sucesso!')
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
    copiar(text, () => { setCopiedPix(true); setTimeout(() => setCopiedPix(false), 2000) })
  }

  function copiarBoleto(text: string) {
    copiar(text, () => { setCopiedBoleto(true); setTimeout(() => setCopiedBoleto(false), 2000) })
  }

  const cardReady = Boolean(resultado?.checkoutUrl)

  return (
    <div style={{ maxWidth: '760px', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      <Card>
        <CardHeader>
          <CardTitle>Pagamentos e recorrência</CardTitle>
        </CardHeader>

        <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div style={{
            padding: '18px 20px',
            borderRadius: '16px',
            background: 'var(--accent-dim)',
            border: '1px solid var(--accent-glow)',
            fontSize: '13px',
            lineHeight: 1.7,
          }}>
            <span style={{ color: 'var(--accent)', fontWeight: 700 }}>Mercado Pago.</span>{' '}
            <span style={{ color: 'var(--text-muted)' }}>
              PIX e boleto seguem no modelo pré-pago. O valor é liberado assim que o pagamento é confirmado pelo Mercado Pago.
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--text-dim)',
            }}>
              Método de pagamento
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }} className="credit-method-row">
              {PAYMENT_OPTIONS.map((option) => {
                const ativo = metodo === option.id
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
                        width: '42px',
                        height: '42px',
                        borderRadius: '14px',
                        flexShrink: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`,
                        background: ativo ? 'rgba(0,212,170,0.08)' : 'color-mix(in srgb, var(--surface-2) 90%, transparent)',
                        color: ativo ? 'var(--accent)' : 'var(--text-dim)',
                      }}>
                        {option.icon}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: ativo ? 'var(--text)' : 'var(--text-muted)' }}>
                          {option.label}
                        </span>
                        <span style={{ fontSize: '11px', color: ativo ? 'var(--text-muted)' : 'var(--text-dim)' }}>
                          {option.note}
                        </span>
                      </span>
                    </span>
                    <span style={{
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      flexShrink: 0,
                      background: ativo ? 'var(--accent)' : 'var(--border-bright)',
                      boxShadow: ativo ? '0 0 0 4px rgba(0,212,170,0.15)' : 'none',
                      transition: 'background 0.15s, box-shadow 0.15s',
                    }} />
                  </button>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--text-dim)',
            }}>
              Valor
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {['50', '100', '200', '500', '1000'].map((preset) => {
                const ativo = valor === preset
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setValor(preset)}
                    style={{
                      padding: '10px 20px',
                      borderRadius: '999px',
                      border: `1px solid ${ativo ? 'var(--accent-glow)' : 'var(--border)'}`,
                      background: ativo ? 'var(--accent-dim)' : 'color-mix(in srgb, var(--surface-2) 88%, transparent)',
                      color: ativo ? 'var(--accent)' : 'var(--text-muted)',
                      fontFamily: 'var(--mono)',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: '10px', opacity: 0.7, marginRight: '3px' }}>R$</span>{preset}
                  </button>
                )
              })}
            </div>
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
                }}
              />
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '-4px' }}>
              Valor mínimo: R$ 50,00
            </p>
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
            }}
          >
            {loading
              ? <Spinner size={16} />
              : metodo === 'CARTAO' ? <CreditCard size={18} /> : <Banknote size={18} />}
            {loading
              ? 'Processando...'
              : `${metodo === 'PIX'
                ? 'Gerar pedido PIX'
                : metodo === 'BOLETO'
                  ? 'Gerar boleto'
                  : 'Iniciar assinatura recorrente'} · ${parseFloat(valor) > 0 ? fmtMoney(valor) : '—'}`}
          </button>
        </div>
      </Card>

      {resultado && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo do pedido</CardTitle>
          </CardHeader>
          <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  Pedido
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{resultado.pedidoId}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  Status
                </div>
                <Badge status={resultado.status} />
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  Valor
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{fmtMoney(resultado.valor)}</div>
              </div>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                  Expira em
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text)' }}>{fmtDateTime(resultado.expiraEm)}</div>
              </div>
            </div>

            {resultado.metodo === 'PIX' && resultado.pix && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                  <QrCode size={16} />
                  PIX copia e cola
                </div>
                <div
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '12px',
                    wordBreak: 'break-all',
                    color: 'var(--text-muted)',
                    background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))',
                    border: '1px solid color-mix(in srgb, var(--accent-glow) 55%, var(--border))',
                    borderRadius: '18px',
                    padding: '20px',
                    cursor: 'pointer',
                    lineHeight: 1.8,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 42px rgba(0,0,0,0.12)',
                  }}
                  onClick={() => copiarPix(resultado.pix!)}
                >
                  {resultado.pix}
                </div>
                <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                  <button type="button" onClick={() => copiarPix(resultado.pix!)} style={actionButtonStyle('accent')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: copiedPix ? 'rgba(16,185,129,0.18)' : 'rgba(0,212,170,0.14)',
                        color: copiedPix ? '#7ef3c5' : 'var(--accent)',
                        border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)',
                      }}>
                        {copiedPix ? <Check size={16} /> : <Copy size={16} />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                          {copiedPix ? 'Código copiado' : 'Copiar código PIX'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          Use no app do banco ou no checkout do Mercado Pago
                        </span>
                      </span>
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: copiedPix ? '#7ef3c5' : 'var(--accent)' }}>
                      {copiedPix ? 'OK' : 'PIX'}
                    </span>
                  </button>
                  {resultado.pixQrCodeUrl && (
                    <a
                      href={resultado.pixQrCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={actionButtonStyle('neutral')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)',
                          color: 'var(--text)',
                          border: '1px solid var(--border)',
                        }}>
                          <ExternalLink size={15} />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir QR Code</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Visualização externa</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-dim)' }}>WEB</span>
                    </a>
                  )}
                </div>
              </>
            )}

            {resultado.metodo === 'BOLETO' && resultado.boleto && (
              <>
                <div style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  color: 'var(--text-muted)',
                  background: 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 95%, transparent), color-mix(in srgb, var(--surface-2) 98%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--info) 16%, var(--border))',
                  borderRadius: '18px',
                  padding: '20px',
                  lineHeight: 1.8,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 18px 42px rgba(0,0,0,0.12)',
                }}>
                  {resultado.boleto}
                </div>
                <div style={{ display: 'flex', gap: '12px' }} className="credit-result-actions">
                  <button type="button" onClick={() => copiarBoleto(resultado.boleto!)} style={actionButtonStyle('neutral')}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: copiedBoleto ? 'rgba(96,165,250,0.18)' : 'color-mix(in srgb, var(--surface-2) 85%, transparent)',
                        color: copiedBoleto ? '#93c5fd' : 'var(--info)',
                        border: '1px solid color-mix(in srgb, var(--info) 30%, var(--border))',
                      }}>
                        {copiedBoleto ? <Check size={16} /> : <Copy size={16} />}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>
                          {copiedBoleto ? 'Linha copiada' : 'Copiar linha digitável'}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                          Compartilhe com o financeiro ou pague no banco
                        </span>
                      </span>
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: copiedBoleto ? '#93c5fd' : 'var(--info)' }}>
                      {copiedBoleto ? 'OK' : 'BOL'}
                    </span>
                  </button>
                  {(resultado.checkoutUrl || resultado.boletoUrl) && (
                    <a
                      href={resultado.checkoutUrl ?? resultado.boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={actionButtonStyle('accent')}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '12px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(0,212,170,0.14)',
                          color: 'var(--accent)',
                          border: '1px solid color-mix(in srgb, var(--accent-glow) 70%, transparent)',
                        }}>
                          <ExternalLink size={15} />
                        </span>
                        <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)' }}>Abrir boleto</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Checkout seguro do Mercado Pago</span>
                        </span>
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--accent)' }}>MP</span>
                    </a>
                  )}
                </div>
              </>
            )}

            {resultado.metodo === 'CARTAO' && (
              <>
                <div style={{
                  padding: '18px',
                  borderRadius: '16px',
                  border: `1px solid ${cardReady ? 'var(--accent-glow)' : 'var(--border)'}`,
                  background: cardReady ? 'var(--accent-dim)' : 'color-mix(in srgb, var(--surface-2) 94%, transparent)',
                  fontSize: '13px',
                  lineHeight: 1.7,
                  color: 'var(--text-muted)',
                }}>
                  {cardReady
                    ? 'O cliente pode seguir para o checkout seguro do Mercado Pago.'
                    : 'Pedido recorrente criado. Se ainda não foi devolvida a URL da assinatura, faça-o retornar `checkout_url`, `redirect_url`, `init_point` ou esses campos no `gateway_payload`.'}
                </div>
                {resultado.subscriptionId && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Assinatura: <span style={{ fontFamily: 'var(--mono)', color: 'var(--text)' }}>{resultado.subscriptionId}</span>
                  </div>
                )}
                {resultado.checkoutUrl && (
                  <a
                    href={resultado.checkoutUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      width: '100%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px 24px',
                      borderRadius: '18px',
                      border: '1px solid rgba(255,255,255,0.14)',
                      background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
                      color: '#041311',
                      fontSize: '14px',
                      fontWeight: 700,
                      textDecoration: 'none',
                    }}
                  >
                    <ExternalLink size={16} />
                    Ir para checkout recorrente
                  </a>
                )}
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
