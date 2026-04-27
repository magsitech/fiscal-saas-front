import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { differenceInCalendarDays } from 'date-fns'
import { AlertTriangle, Ban, Building2, Check, Clock, FlaskConical, Rocket, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi, planosApi } from '@/services/api'
import type { AssinaturaResumo, PlanoCatalogo, TipoPlano } from '@/types'
import { Skeleton } from '@/components/ui'
import { MensalidadeCheckout } from '@/components/planos/MensalidadeCheckout'
import { buildPlanoFeatures, FALLBACK_PAID_PLANOS, formatPlanoPrice, isPaidPlan, PAID_PLAN_IDS, parsePlanoPrice, PLAN_ORDER, sortPlanos } from '@/utils/planos'

const PLANO_LABEL: Record<TipoPlano, string> = {
  TRIAL: 'Trial', BASICO: 'Básico', PRO: 'Pro', BUSINESS: 'Business', CANCELADO: 'Cancelado', INATIVO: 'Inativo',
}

const PLANO_PRECO: Partial<Record<TipoPlano, number>> = {
  BASICO: 29, PRO: 99, BUSINESS: 149,
}

const PLANO_INFO: Partial<Record<TipoPlano, { descricao: string; features: string[]; badge?: string }>> = {
  BASICO: {
    descricao: 'Ideal para volumes baixos.',
    features: ['Validação NF-e e NFC-e', 'Cobrança pré-paga por uso', 'R$ 0,22 fixo por consulta', 'Sem desconto por volume', 'Suporte por e-mail'],
  },
  PRO: {
    descricao: 'Para empresas com volume regular de notas fiscais.',
    features: ['500 consultas/mês incluídas', 'Excedente com cobrança progressiva', 'Validação NF-e e NFC-e', 'Dashboard e relatórios', 'Suporte prioritário'],
    badge: 'Mais popular',
  },
  BUSINESS: {
    descricao: 'Para alto volume com melhor custo no excedente.',
    features: ['1.000 consultas/mês incluídas', 'Excedente começa na faixa 2 (−18%)', 'Validação NF-e e NFC-e', 'Webhook por consulta', 'Suporte prioritário + SLA'],
  },
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
  const [catalogoPlanos, setCatalogoPlanos] = useState<PlanoCatalogo[]>(FALLBACK_PAID_PLANOS)
  const [loading, setLoading] = useState(true)
  const [sandbox, setSandbox] = useState(false)
  const [loadingCancelamento, setLoadingCancelamento] = useState(false)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)
  const [loadingTrial, setLoadingTrial] = useState(false)

  useEffect(() => {
    Promise.all([
      planosApi.assinatura(),
      pedidosApi.config().catch(() => null),
      planosApi.listar().catch(() => FALLBACK_PAID_PLANOS),
    ]).then(([a, config, planos]) => {
      const planosPagos = sortPlanos(planos.filter((plano) => isPaidPlan(plano.id)))
      setAssinatura(a)
      setCatalogoPlanos(planosPagos.length > 0 ? planosPagos : FALLBACK_PAID_PLANOS)
      if (config?.sandbox) setSandbox(true)
    }).finally(() => setLoading(false))
  }, [])

  const plano = (assinatura?.plano ?? 'TRIAL') as TipoPlano
  const cor = PLANO_COLOR[plano] ?? 'var(--accent)'

  const diasTrial = assinatura?.trial_ativo && assinatura.trial_expira_em
    ? Math.max(differenceInCalendarDays(parseISO(assinatura.trial_expira_em), new Date()), 0)
    : null

  const planosDisponiveis = sortPlanos(catalogoPlanos.filter((plano) => isPaidPlan(plano.id)))
  const PLANO_PRECO: Partial<Record<TipoPlano, number>> = Object.fromEntries(
    planosDisponiveis.map((item) => [item.id, parsePlanoPrice(item.mensalidade)])
  ) as Partial<Record<TipoPlano, number>>
  const PLANO_EXTRAS: Partial<Record<TipoPlano, string[]>> = {
    PRO: ['Suporte prioritário'],
    BUSINESS: ['Webhook por consulta', 'Suporte prioritário + SLA'],
  }
  const PLANO_INFO: Partial<Record<TipoPlano, { features: string[] }>> = Object.fromEntries(
    planosDisponiveis.map((item) => [item.id, {
      features: [...buildPlanoFeatures(item), ...(PLANO_EXTRAS[item.id] ?? [])],
    }])
  ) as Partial<Record<TipoPlano, { features: string[] }>>

  const planoPendente: TipoPlano | null =
    assinatura?.plano_selecionado && PAID_PLAN_IDS.includes(assinatura.plano_selecionado) && !PAID_PLAN_IDS.includes(plano)
      ? assinatura.plano_selecionado
      : null

  const [selectedPlan, setSelectedPlan] = useState<TipoPlano | null>(null)
  const planoParaCheckout = planoPendente ?? selectedPlan
  const planoCheckoutSelecionado = planoParaCheckout ? planosDisponiveis.find((item) => item.id === planoParaCheckout) ?? null : null
  const valorCheckout = planoCheckoutSelecionado ? parsePlanoPrice(planoCheckoutSelecionado.mensalidade) : 0

  const podeCancelar =
    assinatura?.plano_ativo &&
    PAID_PLAN_IDS.includes(plano) &&
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

  async function handleAtivarTrial() {
    setLoadingTrial(true)
    try {
      const updated = await planosApi.ativarTrial()
      setAssinatura(updated)
      toast.success('Trial de 14 dias ativado com sucesso!')
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail ?? 'Não foi possível ativar o trial.')
    } finally {
      setLoadingTrial(false)
    }
  }

  function handleCheckoutSuccess(novaAssinatura: AssinaturaResumo) {
    setAssinatura(novaAssinatura)
    setSelectedPlan(null)
  }

  const podeAtivarTrial = !loading && (plano === 'INATIVO' || plano === 'CANCELADO') && !assinatura?.trial_ativo

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

      {/* Trial gratuito para inativos/cancelados */}
      {podeAtivarTrial && (
        <div style={{
          ...card,
          border: '1px solid color-mix(in srgb, var(--info) 28%, var(--border))',
          background: `color-mix(in srgb, var(--info) 5%, var(--surface))`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'color-mix(in srgb, var(--info) 14%, transparent)',
              border: '1px solid color-mix(in srgb, var(--info) 28%, transparent)',
              color: 'var(--info)',
            }}>
              <FlaskConical size={20} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                Teste grátis por 14 dias
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Ative o trial e explore a plataforma sem custo. Após o período, escolha um plano para continuar.
              </div>
            </div>
            <button
              type="button"
              onClick={handleAtivarTrial}
              disabled={loadingTrial}
              style={{
                flexShrink: 0, padding: '10px 22px', borderRadius: '12px', border: 'none',
                background: 'var(--info)', color: '#fff',
                fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 700,
                cursor: loadingTrial ? 'not-allowed' : 'pointer',
                opacity: loadingTrial ? 0.7 : 1,
              }}
            >
              {loadingTrial ? 'Ativando...' : 'Ativar trial'}
            </button>
          </div>
        </div>
      )}

      {/* Checkout de mensalidade */}
      {!loading && planoParaCheckout && valorCheckout > 0 && (
        <>
          {selectedPlan && !planoPendente && (
            <button
              type="button"
              onClick={() => setSelectedPlan(null)}
              style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              ← Voltar
            </button>
          )}
          <MensalidadeCheckout
            plano={planoParaCheckout}
            valor={valorCheckout}
            sandbox={sandbox}
            onSuccess={handleCheckoutSuccess}
          />
        </>
      )}

      {/* Grade de planos — todos os estados */}
      {!loading && !planoParaCheckout && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {PAID_PLAN_IDS.includes(plano) ? 'Alterar plano' : 'Escolher um plano'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {PAID_PLAN_IDS.includes(plano)
                ? 'Faça upgrade ou downgrade a qualquer momento. A cobrança é ajustada no próximo ciclo.'
                : 'Selecione um plano para pagar a mensalidade e ativar sua assinatura.'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '12px' }}>
            {planosDisponiveis.map((p) => {
              const isCurrent = p.id === plano
              const isUpgrade = (PLAN_ORDER[p.id] ?? 0) > (PLAN_ORDER[plano] ?? 0)
              const cor = PLANO_COLOR[p.id]
              return (
                <div
                  key={p.id}
                  style={{
                    padding: '20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '12px',
                    border: `1px solid ${isCurrent ? `color-mix(in srgb, ${cor} 40%, var(--border))` : 'var(--border)'}`,
                    background: isCurrent ? `color-mix(in srgb, ${cor} 8%, var(--surface))` : 'color-mix(in srgb, var(--surface-2) 90%, transparent)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                    <div style={{ fontWeight: 700, fontSize: '15px', color: cor }}>{p.nome}</div>
                    {isCurrent && (
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: `color-mix(in srgb, ${cor} 16%, transparent)`, color: cor, border: `1px solid color-mix(in srgb, ${cor} 30%, transparent)`, letterSpacing: '0.06em' }}>
                        ATUAL
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: '20px', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>
                    R$ {PLANO_PRECO[p.id]}<span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-dim)', marginLeft: '3px' }}>/mês</span>
                  </div>
                  {PLANO_INFO[p.id] && (
                    <>
                      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {PLANO_INFO[p.id]!.features.map((f) => (
                          <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <Check size={13} style={{ color: cor, flexShrink: 0, marginTop: '1px' }} />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => setSelectedPlan(p.id)}
                      style={{
                        marginTop: '4px', padding: '9px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: `color-mix(in srgb, ${cor} 18%, transparent)`,
                        color: cor, fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: 700,
                      }}
                    >
                      {PAID_PLAN_IDS.includes(plano) ? (isUpgrade ? 'Fazer upgrade' : 'Fazer downgrade') : 'Selecionar'}
                    </button>
                  )}
                </div>
              )
            })}
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

