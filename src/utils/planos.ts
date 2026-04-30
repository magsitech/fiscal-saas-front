import type { FaixaPreco, PlanoCatalogo, TipoPlano } from '@/types'
import { fmtBRL, fmtInt } from '@/utils/fmt'

export const PAID_PLAN_IDS: TipoPlano[] = ['BASICO', 'PRO', 'BUSINESS']

export const FALLBACK_FAIXAS: FaixaPreco[] = [
  { id_faixa: 'F1', limite_superior: 500,   preco_base: '0.1900', adicional_fixo: '0.0300', ordem: 1 },
  { id_faixa: 'F2', limite_superior: 2000,  preco_base: '0.1500', adicional_fixo: '0.0300', ordem: 2 },
  { id_faixa: 'F3', limite_superior: 5000,  preco_base: '0.1300', adicional_fixo: '0.0300', ordem: 3 },
  { id_faixa: 'F4', limite_superior: 10000, preco_base: '0.1200', adicional_fixo: '0.0300', ordem: 4 },
  { id_faixa: 'F5', limite_superior: 30000, preco_base: '0.1000', adicional_fixo: '0.0300', ordem: 5 },
  { id_faixa: 'F6', limite_superior: 50000, preco_base: '0.0900', adicional_fixo: '0.0300', ordem: 6 },
  { id_faixa: 'F7', limite_superior: null,  preco_base: '0.0800', adicional_fixo: '0.0300', ordem: 7 },
]

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
    nome: 'Básico',
    mensalidade: '29.00',
    recorrente: true,
    franquia_consultas: 0,
    excedente_inicia_faixa: 0,
    excedente_preco_inicial: '0.22',
    descricao: 'Ideal para volumes baixos.',
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
    features.push(`${fmtInt(plano.franquia_consultas)} consultas/mês incluídas`)
  } else {
    features.push('Cobrança pré-paga por uso')
  }

  features.push('Validação NF-e e NFC-e')

  if (parsePlanoPrice(plano.excedente_preco_inicial) > 0) {
    features.push(`Excedente a partir de R$ ${formatPlanoPrice(plano.excedente_preco_inicial)}/consulta`)
  }

  if (plano.excedente_inicia_faixa > 1) {
    features.push(`Excedente começa na faixa ${fmtInt(plano.excedente_inicia_faixa)}`)
  }

  if (plano.recorrente) {
    features.push('Renovação automática mensal')
  }

  return features
}
