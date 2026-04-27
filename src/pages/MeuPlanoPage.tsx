import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { differenceInCalendarDays } from 'date-fns'
import { AlertTriangle, Ban, Building2, Clock, Rocket, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi, planosApi } from '@/services/api'
import type { AssinaturaResumo, TipoPlano } from '@/types'
import { Skeleton } from '@/components/ui'
import { MensalidadeCheckout } from '@/components/planos/MensalidadeCheckout'

const PLANO_LABEL: Record<TipoPlano, string> = {
  TRIAL: 'Trial', BASICO: 'Básico', PRO: 'Pro', BUSINESS: 'Business', CANCELADO: 'Cancelado', INATIVO: 'Inativo',
}

const PLANO_PRECO: Partial<Record<TipoPlano, number>> = {
  BASICO: 29, PRO: 99, BUSINESS: 149,
}

const PLANOS_PAGOS: TipoPlano[] = ['BASICO', 'PRO', 'BUSINESS']

const PLANO_ICON: Record<TipoPlano, React.ReactNode> = {
  TRIAL: <Clock size={18} />, BASICO: <Star size={18} />, PRO: <Zap size={18} />,
  BUSINESS: <Building2 size={18} />, CANCELADO: <Ban size={18} />, INATIVO: <Ban size={18} />,
} as Record<TipoPlano, React.ReactNode>

const PLANO_COLOR: Record<TipoPlano, string> = {
  TRIAL: 'var(--info)', BASICO: 'var(--accent)', PRO: 'var(--warn)',
  BUSINESS: '#a78bfa', CANCELADO: 'var(--danger)', INATIVO: 'var(--text-dim)',
}

function fmt(val: number | null | undefined, fallback = '-') {
  if (val == null) return fallback
  return val.toLocaleString('pt-BR')
}

function fmtDate(d: string | null | undefined) {
  if (!d) return '-'
  return format(parseISO(d), 'dd/MM/yyyy', { locale: ptBR })
}

export function MeuPlanoPage() {
  const [assinatura, setAssinatura] = useState<AssinaturaResumo | null>(null)
  const [loading, setLoading] = useState(true)
  const [sandbox, setSandbox] = useState(false)
  const [loadingCancelamento, setLoadingCancelamento] = useState(false)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [showCheckout, setShowCheckout] = useState(false)

  useEffect(() => {
    Promise.all([
      planosApi.assinatura(),
      pedidosApi.config().catch(() => null),
    ]).then(([a, config]) => {
      setAssinatura(a)
      if (config?.sandbox) setSandbox(true)
    }).finally(() => setLoading(false))
  }, [])

  const plano = (assinatura?.plano ?? 'TRIAL') as TipoPlano
  const cor = PLANO_COLOR[plano] ?? 'var(--accent)'

  const diasTrial = assinatura?.trial_ativo && assinatura.trial_expira_em
    ? Math.max(differenceInCalendarDays(parseISO(assinatura.trial_expira_em), new Date()), 0)
    : null

  const planoPendente: TipoPlano | null =
    assinatura?.plano_selecionado && PLANOS_PAGOS.includes(assinatura.plano_selecionado) && !PLANOS_PAGOS.includes(plano)
      ? assinatura.plano_selecionado
      : null

  const planoParaCheckout = planoPendente ?? (showCheckout ? plano : null)
  const valorCheckout = planoParaCheckout ? (PLANO_PRECO[planoParaCheckout] ?? 0) : 0

  const podeCancelar =
    assinatura?.plano_ativo &&
    PLANOS_PAGOS.includes(plano) &&
    assinatura?.recorrente !== false

  async function handleCancelar() {
    setLoadingCancelamento(true)
    try {
      await planosApi.cancelar()
      toast.success('Renovação automática cancelada. O plano continua ativo até o fim do ciclo.')
      setConfirmandoCancelamento(false)
      const updated = await planosApi.assinatura()
      setAssinatura(updated)
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail ?? 'Não foi possível cancelar a assinatura.')
    } finally {
      setLoadingCancelamento(false)
    }
  }

  function handleCheckoutSuccess(novaAssinatura: AssinaturaResumo) {
    setAssinatura(novaAssinatura)
    setShowCheckout(false)
  }

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  }

  return (
    <div style={{ maxWidth: '720px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* Hero */}
      <div style={{
        borderRadius: '24px',
        border: `1px solid color-mix(in srgb, ${cor} 30%, var(--border))`,
        padding: '36px',
        background: `linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--surface-2) 80%, ${cor} 6%))`,
        boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
        display: 'flex', alignItems: 'center', gap: '24px',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '18px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `color-mix(in srgb, ${cor} 16%, transparent)`,
          border: `1px solid color-mix(in srgb, ${cor} 28%, transparent)`, color: cor,
        }}>
          {loading ? <Rocket size={22} /> : PLANO_ICON[plano]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-dim)', marginBottom: '6px' }}>
            Plano atual
          </div>
          {loading ? <Skeleton className="h-8 w-32" /> : (
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: cor, lineHeight: 1 }}>
              {PLANO_LABEL[plano] ?? plano}
            </div>
          )}
          {!loading && assinatura?.trial_ativo && diasTrial !== null && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {diasTrial > 0
                ? `Período de teste expira em ${diasTrial} dia${diasTrial !== 1 ? 's' : ''} (${fmtDate(assinatura.trial_expira_em)})`
                : 'Período de teste expirado'}
            </div>
          )}
          {!loading && assinatura?.recorrente === false && assinatura.plano_ativo && assinatura.expiracao_em && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--warn, #ca8a04)' }}>
              Renovação cancelada — ativo até {fmtDate(assinatura.expiracao_em)}
            </div>
          )}
        </div>

        {!loading && assinatura?.proximo_plano && (
          <div style={{ padding: '10px 16px', borderRadius: '14px', background: 'var(--warn-dim, rgba(234,179,8,0.08))', border: '1px solid var(--warn-glow, rgba(234,179,8,0.25))', fontSize: '12px', color: 'var(--warn, #ca8a04)', textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontWeight: 700, marginBottom: '2px' }}>Próximo plano</div>
            <div>{PLANO_LABEL[assinatura.proximo_plano as TipoPlano] ?? assinatura.proximo_plano}</div>
            {assinatura.ciclo_expira_em && (
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>em {fmtDate(assinatura.ciclo_expira_em)}</div>
            )}
          </div>
        )}
      </div>

      {/* Checkout de mensalidade */}
      {!loading && (planoPendente || showCheckout) && planoParaCheckout && valorCheckout > 0 && (
        <MensalidadeCheckout
          plano={planoParaCheckout}
          valor={valorCheckout}
          sandbox={sandbox}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* CTA: plano Trial sem plano selecionado — escolher plano */}
      {!loading && !planoPendente && !showCheckout && (plano === 'TRIAL' || plano === 'INATIVO') && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>Escolher um plano</div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Selecione um dos planos abaixo para fazer o pagamento e ativar sua assinatura.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
            {PLANOS_PAGOS.map((p) => (
              <button
                key={p}
                onClick={() => { setShowCheckout(true); setAssinatura(prev => prev ? { ...prev, plano_selecionado: p } : null) }}
                style={{ padding: '16px', borderRadius: '14px', border: '1px solid var(--border)', background: 'color-mix(in srgb, var(--surface-2) 90%, transparent)', cursor: 'pointer', fontFamily: 'var(--sans)', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '6px' }}
              >
                <div style={{ fontWeight: 700, fontSize: '14px', color: PLANO_COLOR[p] }}>{PLANO_LABEL[p]}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>R$ {PLANO_PRECO[p]}/mês</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Detalhes da assinatura */}
      <div style={card}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '20px' }}>
          Detalhes da assinatura
        </div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-5 w-full" />)}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Início da assinatura', value: fmtDate(assinatura?.assinatura_inicio) },
              { label: 'Início do ciclo', value: fmtDate(assinatura?.ciclo_inicio) },
              { label: 'Fim do ciclo', value: fmtDate(assinatura?.ciclo_expira_em) },
              { label: 'Franquia usada', value: fmt(assinatura?.franquia_usada) },
              { label: 'Franquia restante', value: fmt(assinatura?.franquia_restante) },
              { label: 'Limite da franquia', value: fmt(assinatura?.franquia_limite) },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '16px', borderRadius: '14px', background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--text-dim)' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancelamento */}
      {!loading && podeCancelar && (
        <div style={{ ...card, border: '1px solid color-mix(in srgb, var(--danger) 20%, var(--border))' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                Cancelar renovação automática
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Seu plano continua ativo até o fim do ciclo. Após isso, o acesso é desativado.
              </div>
            </div>
            {!confirmandoCancelamento ? (
              <button
                onClick={() => setConfirmandoCancelamento(true)}
                style={{ padding: '10px 20px', borderRadius: '10px', border: '1px solid color-mix(in srgb, var(--danger) 40%, var(--border))', background: 'color-mix(in srgb, var(--danger) 8%, transparent)', color: 'var(--danger)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                Cancelar assinatura
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                <button
                  onClick={() => setConfirmandoCancelamento(false)}
                  style={{ padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Manter plano
                </button>
                <button
                  onClick={handleCancelar}
                  disabled={loadingCancelamento}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', border: 'none', background: 'var(--danger)', color: '#fff', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700, cursor: loadingCancelamento ? 'not-allowed' : 'pointer', opacity: loadingCancelamento ? 0.7 : 1 }}
                >
                  <AlertTriangle size={14} />
                  {loadingCancelamento ? 'Cancelando...' : 'Confirmar cancelamento'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
