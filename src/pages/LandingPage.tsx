import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Building2, Check, CreditCard, Eye, EyeOff, Lock, Mail, Phone, Sparkles, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PublicNav, scrollToSection } from '@/components/layout/PublicNav'
import { authApi, planosApi } from '@/services/api'
import type { PlanoCatalogo, TipoPlano } from '@/types'
import { FALLBACK_PAID_PLANOS, formatPlanoPrice, parsePlanoPrice, sortPlanos } from '@/utils/planos'
import { formatBrazilPhone, normalizeBrazilPhone } from '@/utils/phone'
import { Spinner } from '@/components/ui'

// ─── Icons ───────────────────────────────────────────────────────────────────

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}
function ActivityIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}
function DollarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  )
}
function MonitorIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  )
}
function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  )
}

// ─── Static data ─────────────────────────────────────────────────────────────

const VANTAGENS = [
  { icon: <ShieldIcon />, title: 'Consulta automatizada via RPA', desc: 'Consultas realizadas por RPA, com automação do fluxo, rastreabilidade operacional e estabilidade para uso em escala.' },
  { icon: <ActivityIcon />, title: 'Arquitetura anti-bloqueio', desc: 'Fila de processamento, rate limit controlado e operação preparada para estabilidade em produção.' },
  { icon: <DollarIcon />, title: 'Cobrança progressiva', desc: 'Quanto maior o volume no período, menor o custo unitário por consulta.' },
  { icon: <MonitorIcon />, title: 'Painel completo', desc: 'Dashboard com auditoria fiscal, extrato financeiro, simulador de custos e compra de créditos.' },
  { icon: <UsersIcon />, title: 'Gestão segura por cliente', desc: 'Cada cliente opera com saldo, auditoria e histórico próprios, com separação clara entre ambientes.' },
]

const STEPS = [
  { num: '01', title: 'Leitura dos dados da nota', desc: 'Seu sistema captura a chave da NF-e ou NFC-e e os dados necessários para validação.' },
  { num: '02', title: 'Envio para a API', desc: 'A aplicação envia os dados da consulta para a nossa API, respeitando o ambiente configurado.' },
  { num: '03', title: 'Consulta oficial na SEFAZ', desc: 'Processamos a validação pelos serviços oficiais, sem atalhos e sem fontes paralelas.' },
  { num: '04', title: 'Retorno com auditoria', desc: 'Você recebe o resultado da validação e mantém o histórico disponível para auditoria e conferência.' },
]

const PILARES = [
  { title: 'Origem prática', description: 'Nascemos a partir de um problema vivido no dia a dia, com foco em resolver entraves reais da rotina fiscal.' },
  { title: 'Infraestrutura moderna', description: 'Desenvolvemos soluções com precisão, velocidade e confiabilidade para dar mais segurança às operações.' },
  { title: 'Visão de plataforma', description: 'Pensamos no produto com clareza, construímos com disciplina e entregamos uma base sólida para crescer.' },
]


type LandingPlan = {
  id: TipoPlano
  nome: string
  preco: number | null
  descricao: string
  features: string[]
  metrics: Array<{ label: string; value: string }>
  destaque: boolean
  badge: string | null
  btnLabel: string
  isTrial: boolean
}

const TRIAL_HIGHLIGHTS = [
  '14 dias com acesso completo',
  'R$ 50,00 em créditos para testar',
  'Sem cartão de crédito',
]

const TRIAL_PLAN: LandingPlan = {
  id: 'TRIAL',
  nome: 'Trial',
  preco: null,
  descricao: 'Teste o fluxo completo antes de definir sua operação mensal.',
  features: ['Validação NF-e e NFC-e', 'Dashboard com auditoria e relatórios', 'Ativação imediata, sem cartão'],
  metrics: [
    { label: 'Duração', value: '14 dias' },
    { label: 'Crédito inicial', value: 'R$ 50,00' },
  ],
  destaque: false,
  badge: 'Trial guiado',
  btnLabel: 'Começar trial',
  isTrial: true,
}


function buildLandingPaidPlan(plano: PlanoCatalogo): LandingPlan {
  const excedentePreco = parsePlanoPrice(plano.excedente_preco_inicial)
  const features = plano.franquia_consultas > 0
    ? [
        `${plano.franquia_consultas.toLocaleString('pt-BR')} consultas/mês incluídas`,
        plano.excedente_inicia_faixa > 1
          ? `Excedente começa na faixa ${plano.excedente_inicia_faixa}`
          : 'Excedente com cobrança progressiva',
        'Validação NF-e e NFC-e',
        plano.recorrente ? 'Renovação automática mensal' : 'Contratação sob demanda',
        plano.id === 'BUSINESS' ? 'Webhook por consulta' : 'Suporte prioritário',
      ]
    : [
        'Validação NF-e e NFC-e',
        'Cobrança pré-paga por uso',
        ...(excedentePreco > 0 ? [`R$ ${formatPlanoPrice(plano.excedente_preco_inicial)} fixo por consulta`] : []),
        plano.recorrente ? 'Renovação automática mensal' : 'Contratação sob demanda',
        'Sem desconto por volume',
      ]

  return {
    id: plano.id,
    nome: plano.nome,
    preco: parsePlanoPrice(plano.mensalidade),
    descricao: plano.descricao,
    features,
    metrics: [],
    destaque: plano.id === 'PRO',
    badge: plano.id === 'PRO' ? 'Mais popular' : null,
    btnLabel: `Escolher ${plano.nome}`,
    isTrial: false,
  }
}

const FAIXAS = [
  { range: '1 - 500', base: 'R$ 0,19', fixed: 'R$ 0,03', final: 'R$ 0,22', pct: 100 },
  { range: '501 - 2.000', base: 'R$ 0,15', fixed: 'R$ 0,03', final: 'R$ 0,18', pct: 82 },
  { range: '2.001 - 5.000', base: 'R$ 0,13', fixed: 'R$ 0,03', final: 'R$ 0,16', pct: 73 },
  { range: '5.001 - 10.000', base: 'R$ 0,12', fixed: 'R$ 0,03', final: 'R$ 0,15', pct: 68 },
  { range: '10.001 - 30.000', base: 'R$ 0,10', fixed: 'R$ 0,03', final: 'R$ 0,13', pct: 59 },
  { range: '30.001 - 50.000', base: 'R$ 0,09', fixed: 'R$ 0,03', final: 'R$ 0,12', pct: 55 },
  { range: '50.001+', base: 'R$ 0,08', fixed: 'R$ 0,03', final: 'R$ 0,11', pct: 50 },
]

// ─── Form helpers ─────────────────────────────────────────────────────────────

type TipoCadastro = 'pf' | 'pj'

const inp = (err?: boolean): React.CSSProperties => ({
  width: '100%', background: 'var(--surface-2)',
  border: `1px solid ${err ? 'var(--danger)' : 'var(--border)'}`,
  borderRadius: '12px', padding: '12px 12px 12px 40px',
  color: 'var(--text)', fontSize: '14px', fontFamily: 'var(--sans)',
  outline: 'none', boxSizing: 'border-box',
})

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.4px', color: 'var(--text-muted)', marginBottom: '6px' }}>
        {label}
      </label>
      {children}
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  )
}

function IcInput({ icon, right, children }: { icon: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', display: 'flex', alignItems: 'center' }}>
        {icon}
      </span>
      {children}
      {right && <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>{right}</span>}
    </div>
  )
}

function SenhaBar({ senha }: { senha: string }) {
  const checks = [senha.length >= 8, /[A-Z]/.test(senha), /\d/.test(senha), /[^A-Za-z0-9]/.test(senha)]
  const n = checks.filter(Boolean).length
  const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#00d4aa']
  const labels = ['8+ chars', 'Maiúscula', 'Número', 'Símbolo']
  if (!senha) return null
  return (
    <div style={{ marginTop: '6px' }}>
      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i < n ? colors[n] : 'var(--border)', transition: 'background .2s' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: '10px', fontSize: '11px', flexWrap: 'wrap' }}>
        {labels.map((label, i) => (
          <span key={label} style={{ color: checks[i] ? 'var(--accent)' : 'var(--text-dim)' }}>{label}</span>
        ))}
      </div>
    </div>
  )
}

function LegalConsent({ checked, onChange, error, inputId }: { checked: boolean; onChange: (v: boolean) => void; error?: string; inputId: string }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ padding: '14px 14px 14px 12px', borderRadius: '14px', border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`, background: 'color-mix(in srgb, var(--surface-2) 90%, transparent)', display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
        <input id={inputId} type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--accent)', cursor: 'pointer', flexShrink: 0 }} />
        <label htmlFor={inputId} style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.65 }}>
          Li e concordo com os{' '}
          <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Termos de Uso</a>
          {' '}e com a{' '}
          <a href="/politica-de-privacidade" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Política de Privacidade</a>.
        </label>
      </div>
      {error && <span style={{ fontSize: '11px', color: 'var(--danger)', marginTop: '4px', display: 'block' }}>{error}</span>}
    </div>
  )
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
      {children}
    </div>
  )
}

function SectionDivider() {
  return <div style={{ height: '1px', background: 'var(--border)', margin: '0 40px' }} />
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LandingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const formRef = useRef<HTMLDivElement>(null)
  const [catalogoPlanos, setCatalogoPlanos] = useState<PlanoCatalogo[]>(FALLBACK_PAID_PLANOS)

  // Pricing form state
  const [selectedPlanId, setSelectedPlanId] = useState<TipoPlano | null>(null)
  const [tipoCadastro, setTipoCadastro] = useState<TipoCadastro | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const [pfForm, setPfForm] = useState({ nome: '', email: '', telefone: '', cpf: '', senha: '', confirmar: '' })
  const [pfErros, setPfErros] = useState<Record<string, string>>({})
  const [pfLegal, setPfLegal] = useState(false)

  const [pjForm, setPjForm] = useState({ razao_social: '', cnpj: '', responsavel: '', email: '', telefone: '', senha: '', confirmar: '' })
  const [pjErros, setPjErros] = useState<Record<string, string>>({})
  const [pjLegal, setPjLegal] = useState(false)
  const planos = [TRIAL_PLAN, ...sortPlanos(catalogoPlanos).map(buildLandingPaidPlan)]
  const paidPlans = planos.filter((plano) => !plano.isTrial)

  useEffect(() => {
    let active = true

    planosApi.listar()
      .then((data) => {
        if (!active || data.length === 0) return
        setCatalogoPlanos(sortPlanos(data.filter((plano) => plano.id === 'BASICO' || plano.id === 'PRO' || plano.id === 'BUSINESS')))
      })
      .catch(() => null)

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const plano = searchParams.get('plano')?.trim().toUpperCase() as TipoPlano | undefined
    const path = location.pathname

    if (plano && planos.some(p => p.id === plano)) {
      setTimeout(() => {
        scrollToSection('planos')
        openForm(plano)
      }, 150)
    } else if (path === '/planos') {
      setTimeout(() => scrollToSection('planos'), 150)
    } else if (path === '/sobre') {
      setTimeout(() => scrollToSection('sobre'), 150)
    } else if (path === '/contato') {
      setTimeout(() => scrollToSection('contato'), 150)
    }
  }, [catalogoPlanos, location.pathname, searchParams])

  function openForm(planId: TipoPlano) {
    setSelectedPlanId(planId)
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80)
  }

  function handleCardBtn(planId: TipoPlano) {
    if (selectedPlanId === planId) {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      openForm(planId)
    }
  }

  function closeForm() {
    setSelectedPlanId(null)
    setTipoCadastro(null)
  }

  function validarSenha(senha: string): string | null {
    if (senha.length < 8) return 'Mínimo de 8 caracteres'
    if (!/[A-Z]/.test(senha)) return 'Precisa de uma maiúscula'
    if (!/\d/.test(senha)) return 'Precisa de um número'
    if (!/[^A-Za-z0-9]/.test(senha)) return 'Precisa de um símbolo'
    return null
  }

  function validarPF() {
    const e: Record<string, string> = {}
    if (!pfForm.nome || pfForm.nome.length < 3) e.nome = 'Mínimo de 3 caracteres'
    if (!pfForm.email || !/\S+@\S+\.\S+/.test(pfForm.email)) e.email = 'E-mail inválido'
    if (pfForm.telefone.trim() && !normalizeBrazilPhone(pfForm.telefone)) e.telefone = 'Informe um telefone válido com DDD'
    if (!/^\d{11}$/.test(pfForm.cpf.replace(/\D/g, ''))) e.cpf = 'CPF: 11 dígitos'
    const se = validarSenha(pfForm.senha); if (se) e.senha = se
    if (pfForm.senha !== pfForm.confirmar) e.confirmar = 'As senhas não coincidem'
    if (!pfLegal) e.legal = 'Você precisa aceitar os Termos de Uso e a Política de Privacidade'
    setPfErros(e)
    return !Object.keys(e).length
  }

  function validarPJ() {
    const e: Record<string, string> = {}
    if (!pjForm.razao_social.trim()) e.razao_social = 'Obrigatório'
    if (!/^\d{14}$/.test(pjForm.cnpj.replace(/\D/g, ''))) e.cnpj = 'CNPJ: 14 dígitos'
    if (!pjForm.responsavel.trim()) e.responsavel = 'Obrigatório'
    if (!pjForm.email || !/\S+@\S+\.\S+/.test(pjForm.email)) e.email = 'E-mail inválido'
    if (pjForm.telefone.trim() && !normalizeBrazilPhone(pjForm.telefone)) e.telefone = 'Informe um telefone válido com DDD'
    const se = validarSenha(pjForm.senha); if (se) e.senha = se
    if (pjForm.senha !== pjForm.confirmar) e.confirmar = 'As senhas não coincidem'
    if (!pjLegal) e.legal = 'Você precisa aceitar os Termos de Uso e a Política de Privacidade'
    setPjErros(e)
    return !Object.keys(e).length
  }

  async function handleCadastroPF(e: FormEvent) {
    e.preventDefault()
    if (!validarPF()) return
    setLoading(true)
    try {
      await authApi.register({
        tipo_cliente: 'PF', nome: pfForm.nome, email: pfForm.email,
        telefone: normalizeBrazilPhone(pfForm.telefone),
        nr_documento: pfForm.cpf.replace(/\D/g, ''),
        senha: pfForm.senha, confirmacao_senha: pfForm.confirmar,
        plano_selecionado: selectedPlanId !== 'TRIAL' && selectedPlanId ? selectedPlanId : undefined,
      })
      navigate('/verificar-email', { state: { email: pfForm.email } })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  async function handleCadastroPJ(e: FormEvent) {
    e.preventDefault()
    if (!validarPJ()) return
    setLoading(true)
    try {
      await authApi.register({
        tipo_cliente: 'PJ', nome: pjForm.responsavel, nome_fantasia: pjForm.razao_social,
        email: pjForm.email, telefone: normalizeBrazilPhone(pjForm.telefone),
        nr_documento: pjForm.cnpj.replace(/\D/g, ''),
        senha: pjForm.senha, confirmacao_senha: pjForm.confirmar,
        plano_selecionado: selectedPlanId !== 'TRIAL' && selectedPlanId ? selectedPlanId : undefined,
      })
      navigate('/verificar-email', { state: { email: pjForm.email } })
    } catch (err: any) {
      toast.error(err?.response?.data?.detail ?? 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (
    <button type="button" onClick={() => setShowPass(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dim)', display: 'flex' }}>
      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  )

  const planoAtual = planos.find(p => p.id === selectedPlanId)

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--sans)', minHeight: '100vh' }}>
      <PublicNav />

      {/* ── HOME ─────────────────────────────────────────────────────────── */}
      <section id="home" style={{ scrollMarginTop: '60px' }}>
        <div className="landing-hero-shell">
          <div
            className="landing-section landing-hero"
            style={{ padding: '80px 40px 64px', textAlign: 'center', maxWidth: '860px', margin: '0 auto' }}
          >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '5px 14px', borderRadius: '20px', border: '1px solid var(--accent-glow)', background: 'var(--accent-dim)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, marginBottom: '24px', letterSpacing: '.4px' }}>
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite', display: 'inline-block' }} />
            Plataforma fiscal B2B
          </div>

          <h1 style={{ fontSize: '48px', fontWeight: 700, lineHeight: 1.12, marginBottom: '20px', letterSpacing: '-0.5px' }}>
            Validação de NF-e e NFC-e{' '}
            <span style={{ color: 'var(--accent)' }}>direto na SEFAZ oficial</span>
          </h1>

          <p style={{ fontSize: '17px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 36px' }}>
            Consulte notas fiscais com rastreabilidade, auditoria e acompanhamento financeiro em uma plataforma feita para dar mais clareza, segurança e confiança à sua rotina.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => scrollToSection('planos')}
              style={{ padding: '13px 28px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '9px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'opacity .15s' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Começar gratuitamente
            </button>
            <button
              onClick={() => scrollToSection('planos')}
              style={{ padding: '13px 28px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border-bright)', borderRadius: '9px', fontSize: '15px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'border-color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-bright)' }}
            >
              Ver planos →
            </button>
          </div>
          </div>
        </div>

        <SectionDivider />
        <div className="landing-section" style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
          <SectionHeader label="Como funciona" title="Da consulta ao resultado auditável" />
          <div className="landing-grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '36px' }}>
            {STEPS.map(step => (
              <div key={step.num} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px 18px' }}>
                <div style={{ fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700, color: 'var(--accent)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>
                    {step.num}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{step.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <SectionDivider />
        <div className="landing-section" style={{ padding: '56px 40px', maxWidth: '1040px', margin: '0 auto' }}>
          <SectionHeader label="Vantagens" title="Por que escolher o validaeNota" />
          <div className="landing-grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '36px' }}>
            {VANTAGENS.map(v => (
              <div key={v.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', marginBottom: '16px' }}>
                  {v.icon}
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '8px' }}>{v.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.65 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOBRE ────────────────────────────────────────────────────────── */}
      <SectionDivider />
      <section id="sobre" className="about-section-shell" style={{ scrollMarginTop: '60px' }}>
        <div className="landing-section" style={{ maxWidth: '1120px', margin: '0 auto', padding: '72px 40px 72px' }}>
          <div className="about-section-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 0.9fr) minmax(0, 1.1fr)', gap: '28px', alignItems: 'stretch' }}>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '28px' }}>
              <div>
                <SectionLabel>Sobre</SectionLabel>
                <h2 style={{ fontSize: '38px', fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.4px', marginBottom: '18px', maxWidth: '520px' }}>
                  Infraestrutura fiscal criada por quem sentiu a operação travar
                </h2>
                <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.8, maxWidth: '540px', margin: 0 }}>
                  O ValidaeNota nasceu de um problema real: consultas fiscais lentas, inconsistentes e difíceis de acompanhar quando a empresa mais precisa de previsibilidade.
                </p>
              </div>

              <div style={{ borderRadius: '22px', overflow: 'hidden', border: '1px solid color-mix(in srgb, var(--accent) 18%, var(--border))', background: 'var(--surface)', boxShadow: 'var(--shadow-soft)' }}>
                <img
                  src="/about-rio-sugarloaf.png"
                  alt="Ilustração do Pão de Açúcar no Rio de Janeiro"
                  style={{ display: 'block', width: '100%', height: 'auto' }}
                />
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--accent-dim) 58%, transparent))', border: '1px solid color-mix(in srgb, var(--accent) 18%, var(--border))', borderRadius: '22px', padding: '30px', boxShadow: 'var(--shadow)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: 'fit-content', padding: '7px 12px', borderRadius: '999px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--accent)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                <Sparkles size={14} />
                Nossa missão
              </div>

              <div style={{ display: 'grid', gap: '16px' }}>
                {[
                  'Depois de lidar de perto com a lentidão, as inconsistências e a complexidade dos serviços da SEFAZ, especialmente no Rio de Janeiro, decidimos construir uma base mais clara para consultas fiscais.',
                  'Criamos soluções que validam dados de notas fiscais de terceiros com precisão, rastreabilidade e confiabilidade, reduzindo erros antes que eles virem retrabalho.',
                  'Pensamos como produto, construímos como engenharia e entregamos como plataforma para ajudar empresas a operar com mais confiança e previsibilidade.',
                ].map((text, i) => (
                  <p key={i} style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, margin: 0 }}>{text}</p>
                ))}
              </div>
            </div>
          </div>

          <div className="about-pillars-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '16px', marginTop: '18px' }}>
            {PILARES.map((item, index) => (
              <div key={item.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '22px', boxShadow: 'var(--shadow-soft)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '10px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 700 }}>
                  0{index + 1}
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{item.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, margin: 0 }}>{item.description}</p>
                </div>
                <ArrowRight size={15} style={{ marginTop: 'auto', color: 'var(--text-dim)' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PLANOS ───────────────────────────────────────────────────────── */}
      <SectionDivider />
      <section id="planos" style={{ scrollMarginTop: '60px' }}>
        <div className="pricing-section pricing-hero" style={{ padding: '56px 40px 40px', textAlign: 'center', maxWidth: '760px', margin: '0 auto' }}>
          <SectionLabel>Planos e preços</SectionLabel>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '14px' }}>
            Escolha o ritmo ideal para a sua operação
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
            Comece no trial para validar o fluxo e, quando o volume estiver claro, avance para um plano mensal com a franquia e o excedente que fazem sentido para a sua rotina.
          </p>
        </div>

        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 40px 28px' }}>
          <div
            className="pricing-grid-2"
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.35fr) auto',
              gap: '18px',
              alignItems: 'center',
              padding: '24px 26px',
              borderRadius: '18px',
              border: selectedPlanId === 'TRIAL' ? '1.5px solid var(--info)' : '1px solid var(--border)',
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 90%, transparent), color-mix(in srgb, var(--info-dim) 65%, transparent))',
              boxShadow: selectedPlanId === 'TRIAL' ? '0 12px 30px rgba(29, 78, 216, 0.12)' : 'var(--shadow-soft)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '999px', background: 'color-mix(in srgb, var(--info) 12%, transparent)', color: 'var(--info)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '14px' }}>
                <Sparkles size={14} />
                {TRIAL_PLAN.badge}
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: 700, lineHeight: 1.15, letterSpacing: '-0.03em', marginBottom: '10px' }}>
                Teste primeiro. Assine depois.
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '720px', marginBottom: '16px' }}>
                Explore a plataforma por 14 dias, use os créditos iniciais e veja seu volume real antes de escolher uma mensalidade.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {TRIAL_HIGHLIGHTS.map((item) => (
                  <div key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '9px 12px', borderRadius: '999px', border: '1px solid color-mix(in srgb, var(--info) 18%, var(--border))', background: 'color-mix(in srgb, var(--surface) 92%, transparent)', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <Check size={14} style={{ color: 'var(--info)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleCardBtn('TRIAL')}
              style={{
                minWidth: '220px',
                padding: '14px 18px',
                borderRadius: '12px',
                border: 'none',
                background: selectedPlanId === 'TRIAL' ? 'var(--info)' : 'color-mix(in srgb, var(--info) 92%, #ffffff 8%)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--sans)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 14px 30px rgba(29, 78, 216, 0.18)',
              }}
            >
              {selectedPlanId === 'TRIAL' ? 'Continuar cadastro' : TRIAL_PLAN.btnLabel}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 40px 48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', alignItems: 'stretch' }} className="pricing-plans-grid">
          {paidPlans.map(plano => {
            const isSelected = selectedPlanId === plano.id
            return (
              <div
                key={plano.id}
                style={{
                  background: plano.destaque
                    ? 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 86%, var(--accent-dim) 14%), var(--surface))'
                    : 'linear-gradient(180deg, color-mix(in srgb, var(--surface) 96%, transparent), color-mix(in srgb, var(--surface-2) 80%, transparent))',
                  border: isSelected
                    ? '2px solid var(--accent)'
                    : plano.destaque
                      ? '1.5px solid var(--accent-glow)'
                      : '1px solid var(--border)',
                  borderRadius: '18px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  height: '100%',
                  boxSizing: 'border-box',
                  transition: 'transform .22s ease, border-color .2s, box-shadow .22s ease, background .22s ease',
                  transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                  boxShadow: isSelected ? '0 18px 34px rgba(0,0,0,0.12)' : 'var(--shadow-soft)',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  if (!isSelected) e.currentTarget.style.transform = 'translateY(-4px)'
                }}
                onMouseLeave={e => {
                  if (!isSelected) e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>
                      Plano mensal
                    </div>
                    <div style={{ fontSize: '26px', fontWeight: 700, lineHeight: 1.05, color: plano.destaque ? 'var(--accent)' : 'var(--text)' }}>
                      {plano.nome}
                    </div>
                  </div>
                  {(plano.badge || isSelected) && (
                    <div style={{ padding: '5px 10px', borderRadius: '999px', background: isSelected ? 'var(--accent)' : 'color-mix(in srgb, var(--accent) 12%, transparent)', color: isSelected ? '#04110d' : 'var(--accent)', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {isSelected ? 'Selecionado' : plano.badge}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: '38px', fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1, color: 'var(--text)' }}>
                      R$ {formatPlanoPrice(plano.preco)}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-dim)', paddingBottom: '5px' }}>/mês</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '18px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                  {plano.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                      <Check size={14} style={{ color: plano.destaque ? 'var(--accent)' : 'var(--text-dim)', flexShrink: 0, marginTop: '1px' }} />
                      {f}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleCardBtn(plano.id)}
                  style={{
                    width: '100%',
                    padding: '13px 14px',
                    background: isSelected || plano.destaque ? 'var(--accent)' : 'var(--surface-2)',
                    color: isSelected || plano.destaque ? '#04110d' : 'var(--text)',
                    border: isSelected || plano.destaque ? 'none' : '1px solid var(--border)',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'var(--sans)',
                    transition: 'opacity .15s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
                >
                  {isSelected ? 'Continuar cadastro' : plano.btnLabel}
                  <ArrowRight size={16} />
                </button>
              </div>
            )
          })}
        </div>
        {/* Inline registration form */}
        {selectedPlanId && planoAtual && (
          <div ref={formRef} style={{ maxWidth: '760px', margin: '0 auto 56px', padding: '0 40px', animation: 'fadeSlideDown .25s ease', scrollMarginTop: '80px' }}>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', overflow: 'hidden' }}>
              <div style={{ padding: '28px 32px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'var(--accent)', marginBottom: '6px' }}>Criar conta</div>
                  <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.03em', marginBottom: '4px' }}>
                    {planoAtual.isTrial ? 'Comece seu trial grátis' : `Assinar plano ${planoAtual.nome}`}
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {planoAtual.isTrial ? '14 dias grátis com R$ 50 em créditos. Sem cartão.' : `R$ ${formatPlanoPrice(planoAtual.preco)}/mês - 14 dias de trial incluídos`}
                  </p>
                </div>
                <button type="button" onClick={closeForm} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'border-color .15s' }}>
                  <X size={15} />
                </button>
              </div>

              <div style={{ padding: '16px 32px', borderBottom: '1px solid var(--border)', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dim)', marginRight: '4px' }}>Plano:</span>
                {planos.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    style={{
                      padding: '5px 14px', borderRadius: '999px', border: 'none',
                      background: selectedPlanId === p.id ? 'var(--accent)' : 'var(--surface-2)',
                      color: selectedPlanId === p.id ? '#04110d' : 'var(--text-muted)',
                      fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)',
                      transition: 'all .15s',
                    }}
                  >
                    {p.nome}{p.preco !== null ? ` - R$${formatPlanoPrice(p.preco)}` : ' - Grátis'}
                  </button>
                ))}
              </div>

              <div style={{ padding: '28px 32px' }}>
                {!tipoCadastro ? (
                  <div>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>Como deseja se cadastrar?</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }} className="auth-type-grid">
                      {([
                        { tipo: 'pf' as TipoCadastro, icon: <User size={22} />, label: 'Pessoa Física', sub: 'Cadastro com CPF' },
                        { tipo: 'pj' as TipoCadastro, icon: <Building2 size={22} />, label: 'Pessoa Jurídica', sub: 'Cadastro com CNPJ' },
                      ]).map(({ tipo, icon, label, sub }) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setTipoCadastro(tipo)}
                          style={{ border: '1.5px solid var(--border)', borderRadius: '16px', padding: '24px 16px', cursor: 'pointer', background: 'transparent', fontFamily: 'var(--sans)', color: 'var(--text)', transition: 'all .18s', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-dim)' }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'var(--surface-2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px', color: 'var(--text-muted)' }}>
                            {icon}
                          </div>
                          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px' }}>{label}</div>
                          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sub}</div>
                        </button>
                      ))}
                    </div>
                    <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', marginTop: '20px' }}>
                      Já tem conta?{' '}
                      <span style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 700 }} onClick={() => navigate('/login')}>Entrar</span>
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                      <button type="button" onClick={() => setTipoCadastro(null)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: '8px', padding: '7px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'border-color .15s' }}>
                        ←
                      </button>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {tipoCadastro === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                      </span>
                    </div>

                    {tipoCadastro === 'pf' && (
                      <form onSubmit={handleCadastroPF} noValidate>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }} className="auth-type-grid">
                          <Field label="Nome completo" error={pfErros.nome}>
                            <IcInput icon={<User size={15} />}><input placeholder="Maria da Silva" value={pfForm.nome} onChange={e => setPfForm({ ...pfForm, nome: e.target.value })} style={inp(!!pfErros.nome)} /></IcInput>
                          </Field>
                          <Field label="E-mail" error={pfErros.email}>
                            <IcInput icon={<Mail size={15} />}><input type="email" placeholder="maria@email.com" value={pfForm.email} onChange={e => setPfForm({ ...pfForm, email: e.target.value })} style={inp(!!pfErros.email)} /></IcInput>
                          </Field>
                          <Field label="CPF" error={pfErros.cpf}>
                            <IcInput icon={<CreditCard size={15} />}><input placeholder="000.000.000-00" maxLength={14} inputMode="numeric" value={pfForm.cpf} onChange={e => setPfForm({ ...pfForm, cpf: e.target.value.replace(/\D/g, '').slice(0, 11) })} style={inp(!!pfErros.cpf)} /></IcInput>
                          </Field>
                          <Field label="Telefone" error={pfErros.telefone}>
                            <IcInput icon={<Phone size={15} />}><input type="tel" placeholder="(11) 99999-8888" inputMode="tel" value={pfForm.telefone} onChange={e => setPfForm({ ...pfForm, telefone: formatBrazilPhone(e.target.value) })} style={inp(!!pfErros.telefone)} /></IcInput>
                          </Field>
                          <Field label="Senha" error={pfErros.senha}>
                            <IcInput icon={<Lock size={15} />} right={eyeBtn}><input type={showPass ? 'text' : 'password'} placeholder="Mín. 8 caracteres" value={pfForm.senha} onChange={e => setPfForm({ ...pfForm, senha: e.target.value })} style={inp(!!pfErros.senha)} /></IcInput>
                            <SenhaBar senha={pfForm.senha} />
                          </Field>
                          <Field label="Confirmar senha" error={pfErros.confirmar}>
                            <IcInput icon={<Lock size={15} />}><input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={pfForm.confirmar} onChange={e => setPfForm({ ...pfForm, confirmar: e.target.value })} style={inp(!!pfErros.confirmar)} /></IcInput>
                          </Field>
                        </div>
                        <LegalConsent checked={pfLegal} onChange={setPfLegal} error={pfErros.legal} inputId="pf-legal" />
                        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '4px', padding: '13px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, transition: 'opacity .15s' }}>
                          {loading ? <Spinner size={16} /> : 'Criar conta'}
                        </button>
                      </form>
                    )}

                    {tipoCadastro === 'pj' && (
                      <form onSubmit={handleCadastroPJ} noValidate>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }} className="auth-type-grid">
                          <Field label="Razão social" error={pjErros.razao_social}>
                            <IcInput icon={<Building2 size={15} />}><input placeholder="Empresa Exemplo LTDA" value={pjForm.razao_social} onChange={e => setPjForm({ ...pjForm, razao_social: e.target.value })} style={inp(!!pjErros.razao_social)} /></IcInput>
                          </Field>
                          <Field label="CNPJ" error={pjErros.cnpj}>
                            <IcInput icon={<CreditCard size={15} />}><input placeholder="00.000.000/0001-00" maxLength={18} inputMode="numeric" value={pjForm.cnpj} onChange={e => setPjForm({ ...pjForm, cnpj: e.target.value.replace(/\D/g, '').slice(0, 14) })} style={inp(!!pjErros.cnpj)} /></IcInput>
                          </Field>
                          <Field label="Nome do responsável" error={pjErros.responsavel}>
                            <IcInput icon={<User size={15} />}><input placeholder="João da Silva" value={pjForm.responsavel} onChange={e => setPjForm({ ...pjForm, responsavel: e.target.value })} style={inp(!!pjErros.responsavel)} /></IcInput>
                          </Field>
                          <Field label="E-mail corporativo" error={pjErros.email}>
                            <IcInput icon={<Mail size={15} />}><input type="email" placeholder="contato@empresa.com" value={pjForm.email} onChange={e => setPjForm({ ...pjForm, email: e.target.value })} style={inp(!!pjErros.email)} /></IcInput>
                          </Field>
                          <Field label="Telefone" error={pjErros.telefone}>
                            <IcInput icon={<Phone size={15} />}><input type="tel" placeholder="(11) 99999-8888" inputMode="tel" value={pjForm.telefone} onChange={e => setPjForm({ ...pjForm, telefone: formatBrazilPhone(e.target.value) })} style={inp(!!pjErros.telefone)} /></IcInput>
                          </Field>
                          <div />
                          <Field label="Senha" error={pjErros.senha}>
                            <IcInput icon={<Lock size={15} />} right={eyeBtn}><input type={showPass ? 'text' : 'password'} placeholder="Mín. 8 caracteres" value={pjForm.senha} onChange={e => setPjForm({ ...pjForm, senha: e.target.value })} style={inp(!!pjErros.senha)} /></IcInput>
                            <SenhaBar senha={pjForm.senha} />
                          </Field>
                          <Field label="Confirmar senha" error={pjErros.confirmar}>
                            <IcInput icon={<Lock size={15} />}><input type={showPass ? 'text' : 'password'} placeholder="Repita a senha" value={pjForm.confirmar} onChange={e => setPjForm({ ...pjForm, confirmar: e.target.value })} style={inp(!!pjErros.confirmar)} /></IcInput>
                          </Field>
                        </div>
                        <LegalConsent checked={pjLegal} onChange={setPjLegal} error={pjErros.legal} inputId="pj-legal" />
                        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: '4px', padding: '13px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', opacity: loading ? 0.7 : 1, transition: 'opacity .15s' }}>
                          {loading ? <Spinner size={16} /> : 'Criar conta'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Pricing table */}
        <div className="pricing-section" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 40px 32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '8px' }}>Cobrança por uso</div>
            <h3 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Excedente após a franquia</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.6 }}>
              Quando o volume supera a franquia incluída, o excedente é cobrado de forma progressiva e cumulativa. O plano Básico aplica R$ 0,22 fixo sem progressão.
            </p>
          </div>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
            <div className="pricing-card-header" style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))', borderBottom: '1px solid var(--border)', padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>Tabela de faixas com cobrança progressiva</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Quanto mais consultas no período, menor o custo por validação.</p>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 12px', borderRadius: '20px', background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)', color: 'var(--accent)', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap' }}>
                + R$ 0,03 fixo por consulta
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '720px' }}>
                <thead>
                  <tr>
                    {['Faixa', 'Preço base', '+ fixo', 'Custo final', 'Escala'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '11px 20px', fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'var(--text-dim)', background: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FAIXAS.map(f => (
                    <tr key={f.range}>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>{f.range}</td>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{f.base}</td>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-muted)' }}>{f.fixed}</td>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{f.final}</td>
                      <td style={{ padding: '13px 20px', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ width: '140px', height: '5px', background: 'var(--surface-2)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${f.pct}%`, height: '100%', background: 'var(--accent)', borderRadius: '3px' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="pricing-grid-2 pricing-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '900px', margin: '0 auto', padding: '0 40px 64px' }}>
          <InfoBox title="Franquia inclusa no plano">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>Pro e Business incluem consultas mensais sem custo adicional. Ao atingir o limite, o excedente é cobrado pelas faixas progressivas.</p>
          </InfoBox>
          <InfoBox title="Cobrança progressiva cumulativa">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>O custo acompanha o volume acumulado. Conforme o uso cresce, o valor unitário diminui automaticamente.</p>
          </InfoBox>
          <InfoBox title="Créditos pré-pagos">
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7 }}>O excedente é descontado do saldo pré-pago. Recarregue via PIX ou boleto, com saldo válido por 30 dias.</p>
          </InfoBox>
        </div>
      </section>

      {/* ── CONTATO ──────────────────────────────────────────────────────── */}
      <SectionDivider />
      <section id="contato" style={{ scrollMarginTop: '60px' }}>
        <div style={{ padding: '64px 40px 40px', maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>
          <SectionLabel>Contato</SectionLabel>
          <h2 style={{ fontSize: '36px', fontWeight: 700, letterSpacing: '-0.4px', marginBottom: '16px' }}>
            Fale com a nossa equipe
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.8, margin: '0 auto' }}>
            Se você quiser tirar dúvidas, conversar sobre a plataforma ou entender melhor como podemos ajudar, estaremos à disposição.
          </p>
        </div>

        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '0 40px 72px' }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '20px', padding: '32px', boxShadow: 'var(--shadow)', textAlign: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-dim)', marginBottom: '12px' }}>
              Nosso e-mail
            </div>
            <a href="mailto:contato@magsitech.com.br" style={{ display: 'inline-block', fontSize: '22px', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none', wordBreak: 'break-word' }}>
              contato@magsitech.com.br
            </a>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7, margin: '18px auto 0', maxWidth: '520px' }}>
              Envie sua mensagem e retornaremos assim que possível.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <div style={{ background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 82%, var(--accent-dim) 18%), var(--surface))', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '56px 40px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '12px' }}>Pronto para validar suas notas fiscais?</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '28px' }}>
          Crie sua conta em menos de 2 minutos. Sem cartão de crédito para começar.
        </p>
        <button
          onClick={() => scrollToSection('planos')}
          style={{ padding: '13px 32px', background: 'var(--accent)', color: '#04110d', border: 'none', borderRadius: '9px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--sans)', transition: 'opacity .15s' }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.85' }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
        >
          Criar conta gratuitamente
        </button>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-dim)', textAlign: 'center', lineHeight: 1.6 }}>
          © 2026 validaENota. Plataforma de validação fiscal brasileira.
          <br />
          MAGSI TECH CONSULTORIA EM TECNOLOGIA DA INFORMACAO LTDA - CNPJ: 66.328.989/0001-75
        </span>
      </footer>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <>
      <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '10px' }}>
        {label}
      </div>
      <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.3px' }}>{title}</h2>
    </>
  )
}

function InfoBox({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '22px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '14px' }}>{title}</h3>
      {children}
    </div>
  )
}


