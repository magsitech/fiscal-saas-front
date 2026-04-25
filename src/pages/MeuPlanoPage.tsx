import { useEffect, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { differenceInCalendarDays } from 'date-fns'
import { Star, Zap, Building2, Rocket, Ban, Clock } from 'lucide-react'
import { planosApi } from '@/services/api'
import type { AssinaturaResumo, TipoPlano } from '@/types'
import { Skeleton } from '@/components/ui'

const PLANO_LABEL: Record<TipoPlano, string> = {
  TRIAL: 'Trial', BASICO: 'Básico', PRO: 'Pro', BUSINESS: 'Business', CANCELADO: 'Cancelado',
}

const PLANO_ICON: Record<TipoPlano, React.ReactNode> = {
  TRIAL: <Clock size={18} />,
  BASICO: <Star size={18} />,
  PRO: <Zap size={18} />,
  BUSINESS: <Building2 size={18} />,
  CANCELADO: <Ban size={18} />,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any

const PLANO_COLOR: Record<TipoPlano, string> = {
  TRIAL: 'var(--info)',
  BASICO: 'var(--accent)',
  PRO: 'var(--warn)',
  BUSINESS: '#a78bfa',
  CANCELADO: 'var(--danger)',
}

function fmt(val: number | null | undefined, fallback = '-') {
  if (val == null) return fallback
  return val.toLocaleString('pt-BR')
}

export function MeuPlanoPage() {
  const [assinatura, setAssinatura] = useState<AssinaturaResumo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    planosApi.assinatura()
      .then(setAssinatura)
      .catch(() => null)
      .finally(() => setLoading(false))
  }, [])

  const plano = assinatura?.plano ?? 'TRIAL'
  const cor = PLANO_COLOR[plano as TipoPlano] ?? 'var(--accent)'

  const diasTrial = assinatura?.trial_ativo && assinatura.trial_expira_em
    ? Math.max(differenceInCalendarDays(parseISO(assinatura.trial_expira_em), new Date()), 0)
    : null

  const fmtDate = (d: string | null | undefined) =>
    d ? format(parseISO(d), "dd/MM/yyyy", { locale: ptBR }) : '-'

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
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '18px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: `color-mix(in srgb, ${cor} 16%, transparent)`,
          border: `1px solid color-mix(in srgb, ${cor} 28%, transparent)`,
          color: cor,
        }}>
          {loading ? <Rocket size={22} /> : PLANO_ICON[plano as TipoPlano]}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--text-dim)', marginBottom: '6px' }}>
            Plano atual
          </div>
          {loading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <div style={{ fontSize: '32px', fontWeight: 800, letterSpacing: '-0.03em', color: cor, lineHeight: 1 }}>
              {PLANO_LABEL[plano as TipoPlano] ?? plano}
            </div>
          )}
          {!loading && assinatura?.trial_ativo && diasTrial !== null && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
              {diasTrial > 0
                ? `Período de teste expira em ${diasTrial} dia${diasTrial !== 1 ? 's' : ''} (${fmtDate(assinatura.trial_expira_em)})`
                : 'Período de teste expirado'}
            </div>
          )}
        </div>

        {!loading && assinatura?.proximo_plano && (
          <div style={{
            padding: '10px 16px', borderRadius: '14px',
            background: 'var(--warn-dim, rgba(234,179,8,0.08))',
            border: '1px solid var(--warn-glow, rgba(234,179,8,0.25))',
            fontSize: '12px', color: 'var(--warn, #ca8a04)',
            textAlign: 'center', flexShrink: 0,
          }}>
            <div style={{ fontWeight: 700, marginBottom: '2px' }}>Próximo plano</div>
            <div>{PLANO_LABEL[assinatura.proximo_plano as TipoPlano] ?? assinatura.proximo_plano}</div>
            {assinatura.ciclo_expira_em && (
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '4px' }}>
                em {fmtDate(assinatura.ciclo_expira_em)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div style={card}>
        <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'var(--text-dim)', marginBottom: '20px' }}>
          Detalhes da assinatura
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[1,2,3,4].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
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
              <div key={label} style={{
                padding: '16px', borderRadius: '14px',
                background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
                border: '1px solid var(--border)',
                display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
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

    </div>
  )
}
