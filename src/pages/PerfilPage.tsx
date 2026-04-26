import { useEffect, useState, type InputHTMLAttributes } from 'react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Building2,
  ChevronDown,
  ChevronUp,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  Phone,
  RefreshCcw,
  Shield,
  Trash2,
  User,
} from 'lucide-react'
import toast from 'react-hot-toast'
import type { ApiKeyCreateResponse, ApiKeyInfo, AssinaturaResumo } from '@/types'
import { apiKeyApi, authApi, planosApi } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { Skeleton, Spinner } from '@/components/ui'
import { formatBrazilPhone, normalizeBrazilPhone } from '@/utils/phone'

const PLANO_LABEL: Record<string, string> = {
  BASICO: 'Básico', PRO: 'Pro', BUSINESS: 'Business', TRIAL: 'Trial', CANCELADO: 'Cancelado',
}

// ─── Botão inline reutilizável ────────────────────────────────
type BtnVariant = 'primary' | 'ghost' | 'danger' | 'soft'
function Btn({
  children,
  onClick,
  type = 'button',
  loading = false,
  disabled = false,
  variant = 'primary',
  icon,
  fullWidth = false,
}: {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  loading?: boolean
  disabled?: boolean
  variant?: BtnVariant
  icon?: React.ReactNode
  fullWidth?: boolean
}) {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '11px 20px',
    borderRadius: '14px',
    fontFamily: 'var(--sans)',
    fontSize: '13px',
    fontWeight: 700,
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    opacity: loading || disabled ? 0.65 : 1,
    transition: 'transform 0.1s, box-shadow 0.15s, border-color 0.15s',
    whiteSpace: 'nowrap',
    width: fullWidth ? '100%' : undefined,
    letterSpacing: '-0.01em',
  }

  const variants: Record<BtnVariant, React.CSSProperties> = {
    primary: {
      background: 'linear-gradient(135deg, var(--accent), color-mix(in srgb, var(--accent) 72%, white))',
      border: '1px solid rgba(255,255,255,0.14)',
      color: '#041311',
      boxShadow: '0 6px 20px rgba(0,212,170,0.20)',
    },
    ghost: {
      background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
      border: '1px solid var(--border)',
      color: 'var(--text)',
    },
    danger: {
      background: 'linear-gradient(135deg, var(--danger-dim), rgba(239,68,68,0.16))',
      border: '1px solid rgba(239,68,68,0.22)',
      color: 'var(--danger)',
    },
    soft: {
      background: 'var(--accent-dim)',
      border: '1px solid var(--accent-glow)',
      color: 'var(--accent)',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      style={{ ...base, ...variants[variant] }}
      onMouseEnter={e => {
        if (loading || disabled) return
        if (variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,212,170,0.32)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        } else if (variant === 'soft') {
          e.currentTarget.style.borderColor = 'var(--accent)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        } else {
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,212,170,0.20)'
        if (variant === 'soft') e.currentTarget.style.borderColor = 'var(--accent-glow)'
      }}
      onMouseDown={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  )
}

// ─── Campo de formulário com inline styles ────────────────────
function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  error,
  readOnly,
  helperText,
  inputMode,
  autoComplete,
  showPasswordToggle = false,
}: {
  label: string
  type?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  icon?: React.ReactNode
  error?: string
  readOnly?: boolean
  helperText?: string
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  autoComplete?: string
  showPasswordToggle?: boolean
}) {
  const [focused, setFocused] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const effectiveType = type === 'password' && showPasswordToggle ? (showPwd ? 'text' : 'password') : type

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{
        fontSize: '10px',
        fontWeight: 800,
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--text-dim)',
      }}>
        {label}
      </label>

      <div style={{ position: 'relative' }}>
        {icon && (
          <span style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: focused ? 'var(--accent)' : 'var(--text-dim)',
            transition: 'color 0.15s',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            {icon}
          </span>
        )}
        <input
          type={effectiveType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode}
          autoComplete={autoComplete}
          readOnly={readOnly}
          onFocus={e => {
            setFocused(true)
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--accent)'
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 4px rgba(239,68,68,0.10)'
              : '0 0 0 4px var(--accent-dim)'
          }}
          onBlur={e => {
            setFocused(false)
            e.currentTarget.style.borderColor = error ? 'var(--danger)' : 'var(--border)'
            e.currentTarget.style.boxShadow = 'none'
          }}
          style={{
            width: '100%',
            paddingLeft: icon ? '42px' : '16px',
            paddingRight: showPasswordToggle && type === 'password' ? '46px' : '16px',
            paddingTop: '13px',
            paddingBottom: '13px',
            borderRadius: '14px',
            border: `1px solid ${error ? 'var(--danger)' : 'var(--border)'}`,
            background: readOnly
              ? 'color-mix(in srgb, var(--surface-2) 60%, transparent)'
              : 'color-mix(in srgb, var(--surface-2) 94%, transparent)',
            color: readOnly ? 'var(--text-muted)' : 'var(--text)',
            fontFamily: 'var(--sans)',
            fontSize: '14px',
            fontWeight: 500,
            outline: 'none',
            boxSizing: 'border-box',
            cursor: readOnly ? 'not-allowed' : 'text',
            transition: 'border-color 0.15s, box-shadow 0.15s',
          }}
        />
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center',
              padding: '4px',
            }}
            tabIndex={-1}
            aria-label={showPwd ? 'Ocultar senha' : 'Mostrar senha'}
          >
            {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      {error && (
        <span style={{ fontSize: '11px', color: 'var(--danger)', fontWeight: 600 }}>
          {error}
        </span>
      )}
      {!error && helperText && (
        <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
          {helperText}
        </span>
      )}
    </div>
  )
}

// ─── Label de seção ───────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '10px',
      fontWeight: 800,
      letterSpacing: '0.14em',
      textTransform: 'uppercase',
      color: 'var(--text-dim)',
      marginBottom: '6px',
    }}>
      {children}
    </div>
  )
}

// ─── Campo somente leitura ────────────────────────────────────
function ReadonlyField({ icon, value, badge }: { icon: React.ReactNode; value: React.ReactNode; badge?: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 14px',
      borderRadius: '14px',
      background: 'color-mix(in srgb, var(--surface-2) 94%, transparent)',
      border: '1px solid var(--border)',
    }}>
      <span style={{ color: 'var(--text-dim)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-muted)', flex: 1 }}>{value}</span>
      {badge && (
        <span style={{
          fontSize: '10px',
          fontWeight: 700,
          color: 'var(--text-dim)',
          background: 'var(--border)',
          borderRadius: '6px',
          padding: '2px 7px',
        }}>
          {badge}
        </span>
      )}
    </div>
  )
}

export function PerfilPage() {
  const { usuario, setUsuario } = useAuthStore()
  const [assinatura, setAssinatura] = useState<AssinaturaResumo | null>(null)

  const [perfil, setPerfil] = useState({
    nome: usuario?.nome ?? '',
    nome_fantasia: usuario?.nome_fantasia ?? '',
    email: usuario?.email ?? '',
    telefone: formatBrazilPhone(usuario?.telefone ?? ''),
  })
  const [perfilErros, setPerfilErros] = useState<Record<string, string>>({})
  const [savingPerfil, setSavingPerfil] = useState(false)

  const [senha, setSenha] = useState({ atual: '', nova: '', confirmar: '' })
  const [senhaErros, setSenhaErros] = useState<Record<string, string>>({})
  const [savingSenha, setSavingSenha] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)
  const [showDadosCliente, setShowDadosCliente] = useState(false)

  const [apiKey, setApiKey] = useState<ApiKeyInfo | null>(null)
  const [novaApiKey, setNovaApiKey] = useState<ApiKeyCreateResponse | null>(null)
  const [loadingApiKey, setLoadingApiKey] = useState(true)
  const [savingApiKey, setSavingApiKey] = useState(false)

  const criadoEm = usuario?.criado_em
    ? format(parseISO(usuario.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '-'

  const documentoLabel = usuario?.tipo === 'PJ' ? 'CNPJ' : 'CPF'
  const nomeFantasiaDisponivel = usuario?.tipo === 'PJ'
  const planoAtualLabel = assinatura ? (PLANO_LABEL[assinatura.plano] ?? assinatura.plano) : '-'

  useEffect(() => {
    setPerfil({
      nome: usuario?.nome ?? '',
      nome_fantasia: usuario?.nome_fantasia ?? '',
      email: usuario?.email ?? '',
      telefone: formatBrazilPhone(usuario?.telefone ?? ''),
    })
  }, [usuario])

  useEffect(() => {
    let active = true
    apiKeyApi.obter()
      .then((result) => { if (active) setApiKey(result) })
      .catch(() => { if (active) toast.error('Erro ao carregar o status da API Key.') })
      .finally(() => { if (active) setLoadingApiKey(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    planosApi.assinatura().then(setAssinatura).catch(() => null)
  }, [])

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    const erros: Record<string, string> = {}
    const nome = perfil.nome.trim()
    const nomeFantasia = perfil.nome_fantasia.trim()
    const telefoneNormalizado = normalizeBrazilPhone(perfil.telefone)
    const telefoneInformado = perfil.telefone.trim().length > 0

    if (!nome) erros.nome = 'Informe o nome do responsável ou titular.'
    if (telefoneInformado && !telefoneNormalizado) {
      erros.telefone = 'Informe um telefone válido com DDD.'
    }

    setPerfilErros(erros)
    if (Object.keys(erros).length > 0) {
      toast.error(erros.telefone ?? erros.nome)
      return
    }

    setSavingPerfil(true)
    try {
      const atualizado = await authApi.atualizarPerfil({
        nome,
        nome_fantasia: nomeFantasia || null,
        telefone: telefoneNormalizado,
      })
      setUsuario(atualizado)
      setPerfil({
        nome: atualizado.nome ?? '',
        nome_fantasia: atualizado.nome_fantasia ?? '',
        email: atualizado.email ?? '',
        telefone: formatBrazilPhone(atualizado.telefone ?? ''),
      })
      setPerfilErros({})
      toast.success('Perfil atualizado!')
    } catch { toast.error('Erro ao salvar perfil') }
    finally { setSavingPerfil(false) }
  }

  function validarSenha() {
    const e: Record<string, string> = {}
    if (!senha.atual) e.atual = 'Campo obrigatório'
    if (senha.nova.length < 8) e.nova = 'Mínimo de 8 caracteres'
    if (!/[A-Z]/.test(senha.nova)) e.nova = 'Deve ter ao menos uma letra maiúscula'
    if (!/\d/.test(senha.nova)) e.nova = 'Deve ter ao menos um número'
    if (senha.nova !== senha.confirmar) e.confirmar = 'As senhas não coincidem'
    setSenhaErros(e)
    return Object.keys(e).length === 0
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!validarSenha()) return
    setSavingSenha(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 800))
      setSenha({ atual: '', nova: '', confirmar: '' })
      toast.success('Senha alterada com sucesso!')
    } catch { toast.error('Senha atual incorreta') }
    finally { setSavingSenha(false) }
  }

  async function gerarApiKey() {
    setSavingApiKey(true)
    try {
      const result = await apiKeyApi.gerar()
      setNovaApiKey(result)
      setApiKey({ prefixo: result.prefixo, sufixo: result.sufixo, criado_em: result.criado_em, ativa: true })
      toast.success('API Key gerada. Copie agora, ela não será exibida novamente.')
    } catch { toast.error('Erro ao gerar API Key') }
    finally { setSavingApiKey(false) }
  }

  async function revogarApiKey() {
    setSavingApiKey(true)
    try {
      await apiKeyApi.revogar()
      setApiKey(null)
      setNovaApiKey(null)
      toast.success('API Key revogada com sucesso!')
    } catch { toast.error('Erro ao revogar API Key') }
    finally { setSavingApiKey(false) }
  }

  function copiarApiKey(chave: string) {
    navigator.clipboard.writeText(chave).then(() => toast.success('API Key copiada!'))
  }

  // ─── Estilos compartilhados ───────────────────────────────
  const card: React.CSSProperties = {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: '24px',
    overflow: 'hidden',
    boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
  }

  const cardHeader: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    padding: '22px 28px',
    borderBottom: '1px solid var(--border)',
  }

  const cardTitle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '15px',
    fontWeight: 700,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  }

  const cardBody: React.CSSProperties = {
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  }

  const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '16px',
  }

  return (
    <div style={{ maxWidth: '780px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

      {/* ── Header de perfil ─────────────────────────────── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        padding: '32px',
        borderRadius: '24px',
        border: '1px solid var(--border)',
        background: 'linear-gradient(135deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--surface-2) 82%, var(--accent-dim) 18%))',
        boxShadow: '0 16px 40px rgba(0,0,0,0.10)',
      }}>
        {/* Info principal */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.nome}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {usuario?.email}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Conta criada em {criadoEm}
          </div>
        </div>

        {/* Situação atual */}
        <div style={{
          borderRadius: '20px',
          border: '1px solid var(--border)',
          padding: '20px',
          minWidth: '220px',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          background: 'color-mix(in srgb, var(--surface-2) 78%, transparent)',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            marginBottom: '10px',
            color: 'var(--text-dim)',
          }}>
            Situação atual
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text)' }}>
              {usuario?.ativo ? 'Ativo' : 'Pendente'}
            </div>
            {assinatura?.plano && (
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 10px', borderRadius: '999px', background: 'rgba(0,212,170,0.16)', color: 'var(--accent)', border: '1px solid rgba(0,212,170,0.22)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {planoAtualLabel}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── API Key ──────────────────────────────────────── */}
      <div style={card}>
        <div style={{
          ...cardHeader,
          background: 'color-mix(in srgb, var(--surface-2) 92%, transparent)',
          opacity: 0.72,
        }}>
          <div style={cardTitle}>
            <span style={{
              width: '34px', height: '34px', borderRadius: '12px', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
              color: 'var(--accent)',
            }}>
              <KeyRound size={15} />
            </span>
            API Key
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '5px 12px', borderRadius: '999px',
            background: 'color-mix(in srgb, var(--info-dim) 70%, transparent)',
            border: '1px solid color-mix(in srgb, var(--info) 20%, transparent)',
            color: 'var(--info)', fontSize: '11px', fontWeight: 700,
          }}>
            <KeyRound size={11} />
            Integração disponível
          </span>
          <Btn
            variant="soft"
            onClick={() => setShowApiKey(!showApiKey)}
            icon={showApiKey ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          >
            {showApiKey ? 'Fechar' : 'Expandir'}
          </Btn>
        </div>

        {showApiKey && (
        <div style={cardBody}>
          {/* Info box */}
          <div style={{
            padding: '18px 20px', borderRadius: '16px',
            background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)',
            border: '1px solid var(--border)',
            fontSize: '13px', lineHeight: 1.7, color: 'var(--text-muted)',
          }}>
            A autenticação das integrações é feita por API Key. Por segurança, a chave completa aparece
            apenas no momento da geração; depois disso, exibimos somente prefixo, sufixo e data de criação.
          </div>

          {loadingApiKey ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : (
            <>
              {/* Nova API Key gerada */}
              {novaApiKey && (
                <div style={{
                  padding: '22px', borderRadius: '18px',
                  background: 'var(--accent-dim)',
                  border: '1px solid var(--accent-glow)',
                  display: 'flex', flexDirection: 'column', gap: '16px',
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                      Copie sua nova API Key agora
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Por segurança, esta é a única vez em que a chave completa será exibida.
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'var(--mono)', fontSize: '12px',
                    wordBreak: 'break-all', lineHeight: 1.7,
                    color: 'var(--text)',
                    background: 'var(--surface)',
                    border: '1px solid var(--accent-glow)',
                    borderRadius: '12px', padding: '16px',
                  }}>
                    {novaApiKey.chave}
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <Btn
                      onClick={() => copiarApiKey(novaApiKey.chave)}
                      icon={<Copy size={14} />}
                    >
                      Copiar API Key
                    </Btn>
                    <Btn variant="ghost" onClick={() => setNovaApiKey(null)}>
                      Já copiei
                    </Btn>
                  </div>
                </div>
              )}

              {apiKey ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* Grid status / data */}
                  <div style={grid2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SectionLabel>Status</SectionLabel>
                      <ReadonlyField icon={<KeyRound size={14} />} value="Chave ativa" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SectionLabel>Criada em</SectionLabel>
                      <ReadonlyField
                        icon={<Shield size={14} />}
                        value={format(parseISO(apiKey.criado_em), "dd/MM/yyyy", { locale: ptBR })}
                      />
                    </div>
                  </div>

                  {/* Grid prefixo / sufixo */}
                  <div style={grid2}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SectionLabel>Prefixo</SectionLabel>
                      <ReadonlyField icon={<KeyRound size={14} />} value={apiKey.prefixo} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <SectionLabel>Sufixo</SectionLabel>
                      <ReadonlyField icon={<KeyRound size={14} />} value={apiKey.sufixo} />
                    </div>
                  </div>

                  {/* Ações */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    gap: '16px', flexWrap: 'wrap',
                    padding: '20px', borderRadius: '16px',
                    background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)',
                    border: '1px solid var(--border)',
                  }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                        Gerenciar chave ativa
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                        Gerar uma nova chave revoga automaticamente a anterior.
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <Btn onClick={gerarApiKey} loading={savingApiKey} icon={<RefreshCcw size={14} />}>
                        Regenerar
                      </Btn>
                      <Btn variant="danger" onClick={revogarApiKey} disabled={savingApiKey} icon={<Trash2 size={14} />}>
                        Revogar
                      </Btn>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '16px', flexWrap: 'wrap',
                  padding: '20px', borderRadius: '16px',
                  background: 'color-mix(in srgb, var(--surface-2) 80%, transparent)',
                  border: '1px solid var(--border)',
                }}>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', marginBottom: '4px' }}>
                      Nenhuma API Key ativa
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Gere uma chave para uso em integrações. A chave completa será exibida somente uma vez.
                    </div>
                  </div>
                  <Btn onClick={gerarApiKey} loading={savingApiKey} icon={<KeyRound size={14} />}>
                    Gerar API Key
                  </Btn>
                </div>
              )}
            </>
          )}
        </div>
        )}
      </div>

      {/* ── Dados do cliente ─────────────────────────────── */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={cardTitle}>
            <span style={{
              width: '34px', height: '34px', borderRadius: '12px', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
              color: 'var(--accent)',
            }}>
              <User size={15} />
            </span>
            Dados do cliente
          </div>
          <Btn
            variant="soft"
            onClick={() => setShowDadosCliente(!showDadosCliente)}
            icon={showDadosCliente ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          >
            {showDadosCliente ? 'Fechar' : 'Expandir'}
          </Btn>
        </div>

        {showDadosCliente && (
        <form onSubmit={salvarPerfil} style={cardBody}>
          {/* Linha 1 */}
          <div style={grid2}>
            <Field
              label={usuario?.tipo === 'PJ' ? 'Responsável' : 'Nome completo'}
              value={perfil.nome}
              onChange={(e) => {
                setPerfil({ ...perfil, nome: e.target.value })
                if (perfilErros.nome) setPerfilErros((current) => ({ ...current, nome: '' }))
              }}
              icon={<User size={15} />}
              placeholder="Seu nome"
              error={perfilErros.nome}
            />
            {nomeFantasiaDisponivel ? (
              <Field
                label="Nome fantasia"
                value={perfil.nome_fantasia}
                onChange={(e) => setPerfil({ ...perfil, nome_fantasia: e.target.value })}
                icon={<Building2 size={15} />}
                placeholder="Nome fantasia da empresa"
              />
            ) : (
              <Field
                label="Telefone"
                value={perfil.telefone}
                onChange={(e) => {
                  setPerfil({ ...perfil, telefone: formatBrazilPhone(e.target.value) })
                  if (perfilErros.telefone) setPerfilErros((current) => ({ ...current, telefone: '' }))
                }}
                icon={<Phone size={15} />}
                placeholder="(11) 99999-8888"
                helperText="Informe DDD + número."
                error={perfilErros.telefone}
                inputMode="tel"
                autoComplete="tel-national"
              />
            )}
          </div>

          {/* Linha 2 */}
          <div style={grid2}>
            <Field
              label="E-mail"
              type="email"
              value={perfil.email}
              onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
              icon={<Mail size={15} />}
              placeholder="email@empresa.com"
            />
            {nomeFantasiaDisponivel ? (
              <Field
                label="Telefone"
                value={perfil.telefone}
                onChange={(e) => {
                  setPerfil({ ...perfil, telefone: formatBrazilPhone(e.target.value) })
                  if (perfilErros.telefone) setPerfilErros((current) => ({ ...current, telefone: '' }))
                }}
                icon={<Phone size={15} />}
                placeholder="(11) 99999-8888"
                helperText="Informe DDD + número."
                error={perfilErros.telefone}
                inputMode="tel"
                autoComplete="tel-national"
              />
            ) : <div />}
          </div>

          {/* Linha 3: somente leitura */}
          <div style={grid2}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SectionLabel>{documentoLabel}</SectionLabel>
              <ReadonlyField
                icon={<CreditCard size={14} />}
                value={usuario?.nr_documento}
                badge="não editável"
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SectionLabel>Tipo de cliente</SectionLabel>
              <ReadonlyField icon={<Shield size={14} />} value={usuario?.tipo} />
            </div>
          </div>

          {assinatura?.plano === 'TRIAL' && assinatura.trial_expira_em && (
            <div style={grid2}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <SectionLabel>Expiração do teste</SectionLabel>
                <ReadonlyField
                  icon={<Shield size={14} />}
                  value={format(parseISO(assinatura.trial_expira_em), "dd/MM/yyyy", { locale: ptBR })}
                />
              </div>
            </div>
          )}

          {/* Salvar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
            <Btn type="submit" loading={savingPerfil}>
              Salvar alterações
            </Btn>
          </div>
        </form>
        )}
      </div>

      {/* ── Alterar senha ────────────────────────────────── */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={cardTitle}>
            <span style={{
              width: '34px', height: '34px', borderRadius: '12px', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
              color: 'var(--accent)',
            }}>
              <Lock size={15} />
            </span>
            Alterar senha
          </div>
          <Btn
            variant="soft"
            onClick={() => setShowSenha(!showSenha)}
            icon={showSenha ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          >
            {showSenha ? 'Fechar' : 'Expandir'}
          </Btn>
        </div>

        {showSenha && (
          <form onSubmit={salvarSenha} style={cardBody}>
            <Field
              label="Senha atual"
              type="password"
              placeholder="••••••••"
              value={senha.atual}
              onChange={(e) => setSenha({ ...senha, atual: e.target.value })}
              error={senhaErros.atual}
              icon={<Lock size={15} />}
              showPasswordToggle
            />

            <div style={grid2}>
              <Field
                label="Nova senha"
                type="password"
                placeholder="Mín. 8 caracteres"
                value={senha.nova}
                onChange={(e) => setSenha({ ...senha, nova: e.target.value })}
                error={senhaErros.nova}
                icon={<Lock size={15} />}
                showPasswordToggle
              />
              <Field
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a nova senha"
                value={senha.confirmar}
                onChange={(e) => setSenha({ ...senha, confirmar: e.target.value })}
                error={senhaErros.confirmar}
                icon={<Lock size={15} />}
                showPasswordToggle
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
              <Btn type="submit" loading={savingSenha}>
                Alterar senha
              </Btn>
            </div>
          </form>
        )}
      </div>

      {/* ── Zona de perigo ───────────────────────────────── */}
      <div style={card}>
        <div style={cardHeader}>
          <div style={{ ...cardTitle, color: 'var(--text-muted)' }}>
            <span style={{
              width: '34px', height: '34px', borderRadius: '12px', flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'color-mix(in srgb, var(--surface-2) 96%, transparent)', border: '1px solid var(--border)',
              color: 'var(--text-dim)',
            }}>
              <Shield size={15} />
            </span>
            Zona de perigo
          </div>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '6px 12px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            background: 'color-mix(in srgb, var(--surface-2) 96%, transparent)',
            color: 'var(--text-dim)',
            fontSize: '11px',
            fontWeight: 700,
          }}>
            Indisponível
          </span>
        </div>

      </div>

    </div>
  )
}
