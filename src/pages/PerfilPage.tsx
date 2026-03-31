import { useState } from 'react'
import { useAuthStore } from '@/store/auth'
import { Card, CardHeader, CardTitle, Button, Input } from '@/components/ui'
import { User, Mail, CreditCard, Building2, Lock, Shield, Bell, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import http from '@/services/api'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function PerfilPage() {
  const { usuario, setUsuario, logout } = useAuthStore()

  // ── Dados pessoais ────────────────────────────────────────
  const [perfil, setPerfil] = useState({
    nome: usuario?.nome ?? '',
    email: usuario?.email ?? '',
  })
  const [savingPerfil, setSavingPerfil] = useState(false)

  // ── Senha ─────────────────────────────────────────────────
  const [senha, setSenha] = useState({ atual: '', nova: '', confirmar: '' })
  const [senhaErros, setSenhaErros] = useState<Record<string, string>>({})
  const [savingSenha, setSavingSenha] = useState(false)
  const [showSenha, setShowSenha] = useState(false)

  // ── Empresa ───────────────────────────────────────────────
  const [empresa, setEmpresa] = useState({ razao_social: '', cnpj: '', uf: '' })
  const [savingEmpresa, setSavingEmpresa] = useState(false)

  const criadoEm = usuario?.criado_em
    ? format(parseISO(usuario.criado_em), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : '—'

  // ── Handlers ──────────────────────────────────────────────
  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    if (!perfil.nome.trim()) return toast.error('Nome é obrigatório')
    setSavingPerfil(true)
    try {
      // Endpoint a implementar: PATCH /auth/me
      await new Promise(r => setTimeout(r, 800)) // Simulado
      setUsuario({ ...usuario!, nome: perfil.nome, email: perfil.email })
      toast.success('Perfil atualizado!')
    } catch {
      toast.error('Erro ao salvar perfil')
    } finally {
      setSavingPerfil(false)
    }
  }

  function validarSenha() {
    const e: Record<string, string> = {}
    if (!senha.atual) e.atual = 'Campo obrigatório'
    if (senha.nova.length < 8) e.nova = 'Mínimo 8 caracteres'
    if (!/[A-Z]/.test(senha.nova)) e.nova = 'Deve ter ao menos uma maiúscula'
    if (!/\d/.test(senha.nova)) e.nova = 'Deve ter ao menos um número'
    if (senha.nova !== senha.confirmar) e.confirmar = 'Senhas não coincidem'
    setSenhaErros(e)
    return Object.keys(e).length === 0
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    if (!validarSenha()) return
    setSavingSenha(true)
    try {
      // Endpoint a implementar: POST /auth/change-password
      await new Promise(r => setTimeout(r, 800))
      setSenha({ atual: '', nova: '', confirmar: '' })
      toast.success('Senha alterada com sucesso!')
    } catch {
      toast.error('Senha atual incorreta')
    } finally {
      setSavingSenha(false)
    }
  }

  async function salvarEmpresa(e: React.FormEvent) {
    e.preventDefault()
    const cnpjLimpo = empresa.cnpj.replace(/\D/g, '')
    if (cnpjLimpo.length !== 14) return toast.error('CNPJ inválido — 14 dígitos')
    if (!empresa.razao_social.trim()) return toast.error('Razão social obrigatória')
    if (!empresa.uf) return toast.error('Selecione a UF')
    setSavingEmpresa(true)
    try {
      // Endpoint: POST /empresas
      await new Promise(r => setTimeout(r, 800))
      setEmpresa({ razao_social: '', cnpj: '', uf: '' })
      toast.success('Empresa cadastrada!')
    } catch {
      toast.error('Erro ao cadastrar empresa')
    } finally {
      setSavingEmpresa(false)
    }
  }

  function formatCNPJ(v: string) {
    return v.replace(/\D/g, '').slice(0, 14)
  }

  const UFS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
    'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

  return (
    <div className="max-w-3xl space-y-6">

      {/* ── Cabeçalho do perfil ─────────────────────────────── */}
      <div className="flex items-center gap-5 p-6 rounded-xl border border-[var(--border)] bg-[var(--surface)] perfil-header">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--info)] flex items-center justify-center text-xl font-bold text-black shrink-0 select-none">
          {usuario?.nome?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold truncate">{usuario?.nome}</h2>
          <p className="text-sm text-[var(--text-muted)] truncate">{usuario?.email}</p>
          <p className="text-xs text-[var(--text-dim)] mt-1">Conta criada em {criadoEm}</p>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0 profile-header-status">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--accent-dim)] text-[var(--accent)] border border-[var(--accent-glow)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)]" />
            Ativo
          </span>
          <span className="text-[11px] text-[var(--text-dim)] font-mono">
            {usuario?.id?.slice(0, 8)}…
          </span>
        </div>
      </div>

      {/* ── Dados pessoais ──────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <User size={15} className="text-[var(--accent)]" />
              Dados Pessoais
            </span>
          </CardTitle>
        </CardHeader>
        <form onSubmit={salvarPerfil} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 profile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Input
              label="Nome completo"
              value={perfil.nome}
              onChange={e => setPerfil({ ...perfil, nome: e.target.value })}
              icon={<User size={14} />}
            />
            <Input
              label="E-mail"
              type="email"
              value={perfil.email}
              onChange={e => setPerfil({ ...perfil, email: e.target.value })}
              icon={<Mail size={14} />}
            />
          </div>
          <div className="grid grid-cols-2 gap-4 profile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">CPF</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <CreditCard size={14} className="text-[var(--text-dim)]" />
                <span className="font-mono text-sm text-[var(--text-muted)]">{usuario?.cpf}</span>
                <span className="ml-auto text-[10px] text-[var(--text-dim)] bg-[var(--border)] px-1.5 py-0.5 rounded">
                  não editável
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">ID da Conta</label>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-2)] border border-[var(--border)]">
                <Shield size={14} className="text-[var(--text-dim)]" />
                <span className="font-mono text-sm text-[var(--text-muted)]">{usuario?.id?.slice(0,18)}…</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={savingPerfil}>Salvar alterações</Button>
          </div>
        </form>
      </Card>

      {/* ── Alterar senha ────────────────────────────────────── */}
      <Card>
        <CardHeader className="card-header-responsive">
          <CardTitle>
            <span className="flex items-center gap-2">
              <Lock size={15} className="text-[var(--accent)]" />
              Alterar Senha
            </span>
          </CardTitle>
          <button
            type="button"
            onClick={() => setShowSenha(!showSenha)}
            className="text-xs text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
          >
            {showSenha ? 'Fechar' : 'Expandir'}
          </button>
        </CardHeader>
        {showSenha && (
          <form onSubmit={salvarSenha} className="p-6 space-y-4">
            <Input
              label="Senha atual"
              type="password"
              placeholder="••••••••"
              value={senha.atual}
              onChange={e => setSenha({ ...senha, atual: e.target.value })}
              error={senhaErros.atual}
              icon={<Lock size={14} />}
            />
            <div className="grid grid-cols-2 gap-4 profile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <Input
                label="Nova senha"
                type="password"
                placeholder="Mín. 8 caracteres"
                value={senha.nova}
                onChange={e => setSenha({ ...senha, nova: e.target.value })}
                error={senhaErros.nova}
                icon={<Lock size={14} />}
              />
              <Input
                label="Confirmar nova senha"
                type="password"
                placeholder="Repita a nova senha"
                value={senha.confirmar}
                onChange={e => setSenha({ ...senha, confirmar: e.target.value })}
                error={senhaErros.confirmar}
                icon={<Lock size={14} />}
              />
            </div>
            {/* Indicador de força de senha */}
            {senha.nova && (
              <div className="space-y-1">
                <div className="text-[11px] text-[var(--text-muted)]">Força da senha:</div>
                <div className="flex gap-1">
                  {[
                    senha.nova.length >= 8,
                    /[A-Z]/.test(senha.nova),
                    /\d/.test(senha.nova),
                    /[^A-Za-z0-9]/.test(senha.nova),
                  ].map((ok, i) => (
                    <div
                      key={i}
                      className="flex-1 h-1 rounded-full transition-colors"
                      style={{ background: ok ? 'var(--accent)' : 'var(--border)' }}
                    />
                  ))}
                </div>
                <div className="flex gap-4 text-[11px] text-[var(--text-dim)]">
                  <span className={senha.nova.length >= 8 ? 'text-[var(--accent)]' : ''}>8+ caracteres</span>
                  <span className={/[A-Z]/.test(senha.nova) ? 'text-[var(--accent)]' : ''}>Maiúscula</span>
                  <span className={/\d/.test(senha.nova) ? 'text-[var(--accent)]' : ''}>Número</span>
                  <span className={/[^A-Za-z0-9]/.test(senha.nova) ? 'text-[var(--accent)]' : ''}>Símbolo</span>
                </div>
              </div>
            )}
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={savingSenha}>Alterar senha</Button>
            </div>
          </form>
        )}
      </Card>

      {/* ── Empresas vinculadas ──────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2">
              <Building2 size={15} className="text-[var(--accent)]" />
              Cadastrar Empresa
            </span>
          </CardTitle>
        </CardHeader>
        <form onSubmit={salvarEmpresa} className="p-6 space-y-4">
          <p className="text-sm text-[var(--text-muted)] leading-relaxed">
            Vincule empresas ao seu perfil para organizar as validações por CNPJ emitente.
          </p>
          <div className="grid grid-cols-2 gap-4 profile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <Input
              label="Razão social"
              placeholder="Empresa Exemplo LTDA"
              value={empresa.razao_social}
              onChange={e => setEmpresa({ ...empresa, razao_social: e.target.value })}
              icon={<Building2 size={14} />}
            />
            <Input
              label="CNPJ"
              placeholder="00000000000000"
              value={empresa.cnpj}
              onChange={e => setEmpresa({ ...empresa, cnpj: formatCNPJ(e.target.value) })}
              maxLength={14}
              inputMode="numeric"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 profile-grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">UF</label>
              <select
                value={empresa.uf}
                onChange={e => setEmpresa({ ...empresa, uf: e.target.value })}
                className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] cursor-pointer"
              >
                <option value="">Selecione a UF</option>
                {UFS.map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button type="submit" loading={savingEmpresa}>Cadastrar empresa</Button>
          </div>
        </form>
      </Card>

      {/* ── Zona de perigo ───────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2 text-[var(--danger)]">
              <Shield size={15} />
              Zona de Perigo
            </span>
          </CardTitle>
        </CardHeader>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] danger-row">
            <div>
              <div className="text-sm font-semibold">Encerrar sessão</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">Sair de todos os dispositivos</div>
            </div>
            <Button
              variant="ghost"
              onClick={() => {
                logout()
                window.location.href = '/login'
              }}
            >
              Sair agora
            </Button>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border border-[var(--danger-dim)] bg-[var(--danger-dim)] danger-row">
            <div>
              <div className="text-sm font-semibold text-[var(--danger)]">Excluir conta</div>
              <div className="text-xs text-[var(--text-muted)] mt-0.5">
                Ação irreversível. Todo histórico e saldo serão removidos.
              </div>
            </div>
            <Button
              variant="danger"
              onClick={() => toast.error('Entre em contato com o suporte para excluir a conta.')}
              icon={<Trash2 size={14} />}
            >
              Excluir
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
