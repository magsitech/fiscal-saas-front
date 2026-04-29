import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { differenceInCalendarDays } from 'date-fns'
import { AlertTriangle, Ban, Building2, Check, Clock, FlaskConical, Rocket, Star, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { pedidosApi, planosApi } from '@/services/api'
import type { AssinaturaResumo, PlanoCatalogo, TipoPlano, UpgradePreview } from '@/types'
import { Skeleton } from '@/components/ui'
import { MensalidadeCheckout } from '@/components/planos/MensalidadeCheckout'
import { buildPlanoFeatures, FALLBACK_PAID_PLANOS, formatPlanoPrice, isPaidPlan, PAID_PLAN_IDS, parsePlanoPrice, PLAN_ORDER, sortPlanos } from '@/utils/planos'

const PLANO_LABEL: Record<TipoPlano, string> = {
  TRIAL: 'Trial', BASICO: 'Básico', PRO: 'Pro', BUSINESS: 'Business', CANCELADO: 'Cancelado', INATIVO: 'Inativo',
}

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
  const [upgradePreviewData, setUpgradePreviewData] = useState<{ plano: TipoPlano; preview: UpgradePreview } | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [upgradeConfirmed, setUpgradeConfirmed] = useState(false)
  const [loadingDowngrade, setLoadingDowngrade] = useState(false)

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

  // Only treat as upgrade/downgrade when already on a paid plan
  const isSelectedUpgrade = selectedPlan !== null
    && (PLAN_ORDER[selectedPlan] ?? 0) > (PLAN_ORDER[plano] ?? 0)
    && PAID_PLAN_IDS.includes(plano)
  const isSelectedDowngrade = selectedPlan !== null
    && (PLAN_ORDER[selectedPlan] ?? 0) < (PLAN_ORDER[plano] ?? 0)
    && PAID_PLAN_IDS.includes(plano)

  const isInUpgradePreviewMode = isSelectedUpgrade && !upgradeConfirmed
  // Downgrade preview shows until the user confirms (which triggers direct API call, no checkout)
  const isInDowngradePreviewMode = isSelectedDowngrade

  const planoParaCheckout = planoPendente ?? (
    selectedPlan && (
      (!isSelectedUpgrade && !isSelectedDowngrade) ||
      (isSelectedUpgrade && upgradeConfirmed)
    ) ? selectedPlan : null
  )
  const planoCheckoutSelecionado = planoParaCheckout
    ? planosDisponiveis.find((item) => item.id === planoParaCheckout) ?? null
    : null
  const valorCheckout = upgradeConfirmed && upgradePreviewData
    ? parsePlanoPrice(upgradePreviewData.preview.valor_a_cobrar)
    : planoCheckoutSelecionado ? parsePlanoPrice(planoCheckoutSelecionado.mensalidade) : 0

  const downgradeTargetCatalog = isInDowngradePreviewMode && selectedPlan
    ? planosDisponiveis.find(p => p.id === selectedPlan) ?? null
    : null

  const podeCancelar =
    assinatura?.plano_ativo &&
    PAID_PLAN_IDS.includes(plano) &&
    assinatura?.recorrente !== false

  function resetPlanSelection() {
    setSelectedPlan(null)
    setUpgradePreviewData(null)
    setUpgradeConfirmed(false)
  }

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

  async function handleSelectPlan(planId: TipoPlano) {
    const targetOrder = PLAN_ORDER[planId] ?? 0
    const currentOrder = PLAN_ORDER[plano] ?? 0
    const isUpgrade = targetOrder > currentOrder && PAID_PLAN_IDS.includes(plano)

    setSelectedPlan(planId)
    setUpgradeConfirmed(false)
    setUpgradePreviewData(null)

    if (isUpgrade) {
      setLoadingPreview(true)
      try {
        const preview = await planosApi.upgradePreview(planId)
        setUpgradePreviewData({ plano: planId, preview })
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        toast.error(detail ?? 'Não foi possível calcular o valor do upgrade.')
        setSelectedPlan(null)
      } finally {
        setLoadingPreview(false)
      }
    }
    // downgrade: no API call — preview uses catalog data already loaded
  }

  async function handleDowngradeConfirm() {
    if (!selectedPlan) return
    setLoadingDowngrade(true)
    try {
      const updated = await planosApi.ativar({ plano: selectedPlan, pedido_id: null })
      setAssinatura(updated)
      toast.success(`Downgrade agendado. O plano ${PLANO_LABEL[selectedPlan]} entrará em vigor na próxima renovação.`)
      resetPlanSelection()
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
      toast.error(detail ?? 'Não foi possível agendar o downgrade.')
    } finally {
      setLoadingDowngrade(false)
    }
  }

  function handleCheckoutSuccess(novaAssinatura: AssinaturaResumo) {
    setAssinatura(novaAssinatura)
    resetPlanSelection()
  }

  const podeAtivarTrial = !loading && (plano === 'INATIVO' || plano === 'CANCELADO') && !assinatura?.trial_ativo

  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
  }

  const backButtonStyle: React.CSSProperties = {
    alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '6px',
    padding: '8px 14px', borderRadius: '10px', border: '1px solid var(--border)',
    background: 'transparent', color: 'var(--text-muted)',
    fontFamily: 'var(--sans)', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
  }

  return (
    <div style={{ width: '100%', maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>

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
          {!loading && assinatura?.trial_ativo && (
            <div style={{ marginTop: '10px', fontSize: '13px' }}>
              {diasTrial !== null && diasTrial === 0 ? (
                <span style={{ color: 'var(--danger, #ef4444)', fontWeight: 600 }}>Seu trial encerrou — escolha um plano agora e continue aproveitando todos os recursos sem interrupção!</span>
              ) : (
                <span style={{ color: 'var(--info, #38bdf8)', fontWeight: 600 }}>
                  {diasTrial !== null
                    ? `Seu trial termina em ${diasTrial} dia${diasTrial !== 1 ? 's' : ''} — escolha um plano agora e não perca nenhum recurso!`
                    : `Aproveite ao máximo! Escolha um plano e não perca nenhum recurso.`}
                </span>
              )}
            </div>
          )}
          {!loading && assinatura?.recorrente === false && !assinatura.trial_ativo && assinatura.plano_ativo && assinatura.expiracao_em && (
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

      {/* Checkout de mensalidade (nova assinatura ou upgrade confirmado) */}
      {!loading && planoParaCheckout && valorCheckout > 0 && (
        <>
          {selectedPlan && !planoPendente && (
            <button
              type="button"
              onClick={() => {
                if (upgradeConfirmed) setUpgradeConfirmed(false)
                else resetPlanSelection()
              }}
              style={backButtonStyle}
            >
              ← Voltar
            </button>
          )}
          <MensalidadeCheckout
            plano={planoParaCheckout}
            valor={valorCheckout}
            sandbox={sandbox}
            skipActivation={upgradeConfirmed}
            onSuccess={handleCheckoutSuccess}
          />
        </>
      )}

      {/* Upgrade preview */}
      {!loading && isInUpgradePreviewMode && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button type="button" onClick={resetPlanSelection} style={backButtonStyle}>
            ← Voltar
          </button>
          <div style={card}>
            {loadingPreview ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-5 w-full" />)}
              </div>
            ) : upgradePreviewData ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `color-mix(in srgb, ${PLANO_COLOR[upgradePreviewData.plano]} 14%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${PLANO_COLOR[upgradePreviewData.plano]} 28%, transparent)`,
                    color: PLANO_COLOR[upgradePreviewData.plano],
                  }}>
                    {PLANO_ICON[upgradePreviewData.plano]}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Resumo do upgrade
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 800, color: PLANO_COLOR[upgradePreviewData.plano], lineHeight: 1 }}>
                      Plano {PLANO_LABEL[upgradePreviewData.plano]}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '12px' }}>
                  {[
                    { label: 'A pagar agora', value: formatPlanoPrice(upgradePreviewData.preview.valor_a_cobrar) },
                    { label: 'Dias restantes', value: `${upgradePreviewData.preview.dias_restantes} dia${upgradePreviewData.preview.dias_restantes !== 1 ? 's' : ''}` },
                    { label: 'Nova franquia', value: `${fmt(upgradePreviewData.preview.franquia_novo_plano)} consultas` },
                    { label: 'Já consumido', value: `${fmt(upgradePreviewData.preview.franquia_atual_usada)} consultas` },
                    { label: 'Ciclo mantido até', value: fmtDate(upgradePreviewData.preview.expiracao_mantida) },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '14px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--text-dim)' }}>{label}</div>
                      <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, padding: '12px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--surface-2) 85%, transparent)', border: '1px solid var(--border)' }}>
                  Você paga apenas o proporcional aos dias restantes do ciclo atual. A data de vencimento e o consumo de franquia já realizado são preservados na nova assinatura.
                </div>

                <button
                  type="button"
                  onClick={() => setUpgradeConfirmed(true)}
                  style={{
                    padding: '16px 24px', borderRadius: '16px', border: 'none',
                    background: `color-mix(in srgb, ${PLANO_COLOR[upgradePreviewData.plano]} 18%, transparent)`,
                    color: PLANO_COLOR[upgradePreviewData.plano],
                    fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  Confirmar upgrade — {formatPlanoPrice(upgradePreviewData.preview.valor_a_cobrar)}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Downgrade preview — sem pagamento, apenas agendamento para o próximo ciclo */}
      {!loading && isInDowngradePreviewMode && selectedPlan && downgradeTargetCatalog && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <button type="button" onClick={resetPlanSelection} style={backButtonStyle}>
            ← Voltar
          </button>
          <div style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '14px', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `color-mix(in srgb, ${PLANO_COLOR[selectedPlan]} 14%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${PLANO_COLOR[selectedPlan]} 28%, transparent)`,
                  color: PLANO_COLOR[selectedPlan],
                }}>
                  {PLANO_ICON[selectedPlan]}
                </div>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Resumo do downgrade
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: PLANO_COLOR[selectedPlan], lineHeight: 1 }}>
                    Plano {PLANO_LABEL[selectedPlan]}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Nova mensalidade', value: formatPlanoPrice(downgradeTargetCatalog.mensalidade) },
                  {
                    label: 'Nova franquia',
                    value: downgradeTargetCatalog.franquia_consultas > 0
                      ? `${fmt(downgradeTargetCatalog.franquia_consultas)} consultas`
                      : 'Pré-pago por uso',
                  },
                  { label: 'Franquia atual usada', value: `${fmt(assinatura?.franquia_usada)} consultas` },
                  { label: 'Mudança em', value: fmtDate(assinatura?.ciclo_expira_em) },
                ].map(({ label, value }) => (
                  <div key={label} style={{ padding: '14px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.13em', color: 'var(--text-dim)' }}>{label}</div>
                    <div style={{ fontFamily: 'var(--mono)', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, padding: '12px 16px', borderRadius: '12px', background: 'color-mix(in srgb, var(--surface-2) 85%, transparent)', border: '1px solid var(--border)' }}>
                Nenhum valor será cobrado agora. O downgrade entra em vigor na próxima renovação automática ({fmtDate(assinatura?.ciclo_expira_em)}), quando o novo plano será ativado dentro da recorrência.
              </div>

              <button
                type="button"
                onClick={() => void handleDowngradeConfirm()}
                disabled={loadingDowngrade}
                style={{
                  padding: '16px 24px', borderRadius: '16px', border: 'none',
                  background: `color-mix(in srgb, ${PLANO_COLOR[selectedPlan]} 18%, transparent)`,
                  color: PLANO_COLOR[selectedPlan],
                  fontFamily: 'var(--sans)', fontSize: '14px', fontWeight: 700,
                  cursor: loadingDowngrade ? 'not-allowed' : 'pointer',
                  opacity: loadingDowngrade ? 0.7 : 1,
                }}
              >
                {loadingDowngrade ? 'Agendando...' : `Confirmar downgrade para ${PLANO_LABEL[selectedPlan]}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grade de planos — todos os estados */}
      {!loading && !planoParaCheckout && !isInUpgradePreviewMode && !isInDowngradePreviewMode && (
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
              {PAID_PLAN_IDS.includes(plano) ? 'Alterar plano' : 'Escolher um plano'}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              {PAID_PLAN_IDS.includes(plano)
                ? 'Faça upgrade ou downgrade a qualquer momento.'
                : 'Selecione um plano para pagar a mensalidade e ativar sua assinatura.'}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(175px, 1fr))', gap: '12px' }}>
            {planosDisponiveis.map((p) => {
              const isCurrent = p.id === plano
              const targetOrder = PLAN_ORDER[p.id] ?? 0
              const currentOrder = PLAN_ORDER[plano] ?? 0
              const isUpgrade = targetOrder > currentOrder && PAID_PLAN_IDS.includes(plano)
              const isDowngrade = targetOrder < currentOrder && PAID_PLAN_IDS.includes(plano)
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
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                      {PLANO_INFO[p.id]!.features.map((f) => (
                        <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '7px', fontSize: '12px', color: 'var(--text-muted)' }}>
                          <Check size={13} style={{ color: cor, flexShrink: 0, marginTop: '1px' }} />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}
                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => void handleSelectPlan(p.id)}
                      style={{
                        marginTop: 'auto', padding: '9px 0', borderRadius: '10px', border: 'none', cursor: 'pointer',
                        background: `color-mix(in srgb, ${cor} 18%, transparent)`,
                        color: cor, fontFamily: 'var(--sans)', fontSize: '12px', fontWeight: 700,
                      }}
                    >
                      {isUpgrade ? 'Fazer upgrade' : isDowngrade ? 'Fazer downgrade' : 'Selecionar'}
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