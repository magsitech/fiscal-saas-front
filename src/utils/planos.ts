import type { PlanoCatalogo, TipoPlano } from '@/types'
import { fmtBRL, fmtInt } from '@/utils/fmt'

export const PAID_PLAN_IDS: TipoPlano[] = ['BASICO', 'PRO', 'BUSINESS']

export const PLAN_ORDER: Partial<Record<TipoPlano, number>> = {
  TRIAL: 0,
  BASICO: 1,
  PRO: 2,
  BUSINESS: 3,
  CANCELADO: 4,
  INATIVO: 5,
}

export const FALLBACK_PAID_PLANOS: PlanoCatalogo[] = [
  {
    id: 'BASICO',
    nome: 'Basico',
    mensalidade: '29.00',
    recorrente: true,
    franquia_consultas: 0,
    excedente_inicia_faixa: 0,
    excedente_preco_inicial: '0.22',
    descricao: 'Ideal para volumes baixos e testes em producao.',
  },
  {
    id: 'PRO',
    nome: 'Pro',
    mensalidade: '99.00',
    recorrente: true,
    franquia_consultas: 500,
    excedente_inicia_faixa: 1,
    excedente_preco_inicial: '0.19',
    descricao: 'Para empresas com volume regular de notas fiscais.',
  },
  {
    id: 'BUSINESS',
    nome: 'Business',
    mensalidade: '149.00',
    recorrente: true,
    franquia_consultas: 1000,
    excedente_inicia_faixa: 2,
    excedente_preco_inicial: '0.19',
    descricao: 'Para alto volume com melhor custo no excedente.',
  },
]

export function isPaidPlan(planId: TipoPlano): planId is 'BASICO' | 'PRO' | 'BUSINESS' {
  return PAID_PLAN_IDS.includes(planId)
}

export function sortPlanos<T extends { id: TipoPlano }>(planos: T[]) {
  return [...planos].sort((a, b) => (PLAN_ORDER[a.id] ?? 999) - (PLAN_ORDER[b.id] ?? 999))
}

export function parsePlanoPrice(value: string | number | null | undefined) {
  const parsed = Number(value ?? 0)
  return Number.isFinite(parsed) ? parsed : 0
}

export function formatPlanoPrice(value: string | number | null | undefined) {
  return fmtBRL(parsePlanoPrice(value))
}

export function buildPlanoFeatures(plano: Pick<PlanoCatalogo, 'franquia_consultas' | 'excedente_inicia_faixa' | 'excedente_preco_inicial' | 'recorrente'>) {
  const features: string[] = []

  if (plano.franquia_consultas > 0) {
    features.push(`${fmtInt(plano.franquia_consultas)} consultas/mes incluidas`)
  } else {
    features.push('Cobranca pre-paga por uso')
  }

  features.push('Validacao NF-e e NFC-e')

  if (parsePlanoPrice(plano.excedente_preco_inicial) > 0) {
    features.push(`Excedente a partir de R$ ${formatPlanoPrice(plano.excedente_preco_inicial)}/consulta`)
  }

  if (plano.excedente_inicia_faixa > 0) {
    features.push(`Excedente inicia na faixa ${fmtInt(plano.excedente_inicia_faixa)}`)
  }

  if (plano.recorrente) {
    features.push('Renovacao automatica mensal')
  }

  return features
}
