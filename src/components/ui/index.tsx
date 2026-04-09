import React from 'react'

// ─── Button ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'soft'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  icon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold rounded-[18px] border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none shadow-[0_14px_34px_rgba(15,23,42,0.10)] hover:-translate-y-[1px] active:translate-y-0 focus-visible:outline-none focus-visible:ring-4'

  const variants = {
    primary: 'bg-[linear-gradient(135deg,var(--accent),color-mix(in_srgb,var(--accent)_72%,white))] text-[#041311] border-[rgba(255,255,255,0.18)] hover:brightness-105 active:brightness-95 focus-visible:ring-[var(--accent-dim)]',
    ghost: 'bg-[linear-gradient(180deg,color-mix(in_srgb,var(--surface)_92%,transparent),color-mix(in_srgb,var(--surface-2)_96%,transparent))] text-[var(--text)] border-[color-mix(in_srgb,var(--border)_88%,white_4%)] hover:border-[var(--border-bright)] hover:bg-[var(--surface-3)] focus-visible:ring-[var(--accent-dim)]',
    danger: 'bg-[linear-gradient(135deg,var(--danger-dim),rgba(239,68,68,0.16))] text-[var(--danger)] border-[rgba(239,68,68,0.2)] hover:bg-[var(--danger)] hover:text-white hover:border-[var(--danger)] focus-visible:ring-[rgba(239,68,68,0.18)]',
    soft: 'bg-[linear-gradient(135deg,color-mix(in_srgb,var(--accent-dim)_84%,transparent),color-mix(in_srgb,var(--info-dim)_72%,transparent))] text-[var(--accent)] border-[var(--accent-glow)] hover:border-[var(--accent)] hover:text-[var(--text)] focus-visible:ring-[var(--accent-dim)]',
  }

  const sizes = {
    sm: 'px-3.5 py-2 text-xs',
    md: 'px-4.5 py-2.5 text-sm',
    lg: 'px-5 py-3 text-sm',
  }

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size={14} /> : icon}
      {children}
    </button>
  )
}

// ─── Spinner ─────────────────────────────────────────────────
export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="animate-spin"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

// ─── Badge ───────────────────────────────────────────────────
type BadgeVariant = 'green' | 'yellow' | 'red' | 'blue' | 'gray'

const STATUS_MAP: Record<string, [BadgeVariant, string]> = {
  AUTORIZADA:   ['green',  'Autorizada'],
  CONFIRMADO:   ['green',  'Confirmado'],
  ATIVO:        ['green',  'Ativo'],
  CANCELADA:    ['red',    'Cancelada'],
  DENEGADA:     ['red',    'Denegada'],
  ERRO:         ['red',    'Erro'],
  EXPIRADO:     ['red',    'Expirado'],
  ZERADO:       ['red',    'Zerado'],
  PENDENTE:     ['yellow', 'Pendente'],
  PROCESSANDO:  ['blue',   'Processando'],
  CACHE_HIT:    ['blue',   'Cache Hit'],
  SEM_SALDO:    ['gray',   'Sem Saldo'],
}

const BADGE_CLASSES: Record<BadgeVariant, string> = {
  green:  'bg-[var(--accent-dim)] text-[var(--accent)]',
  yellow: 'bg-[var(--warn-dim)] text-[var(--warn)]',
  red:    'bg-[var(--danger-dim)] text-[var(--danger)]',
  blue:   'bg-[var(--info-dim)] text-[var(--info)]',
  gray:   'bg-[color-mix(in_srgb,var(--surface-2)_88%,transparent)] text-[var(--text)]',
}

export function Badge({ status, label }: { status: string; label?: string }) {
  const [variant, defaultLabel] = STATUS_MAP[status] ?? ['gray', status]
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold ${BADGE_CLASSES[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {label ?? defaultLabel}
    </span>
  )
}

// ─── Card ────────────────────────────────────────────────────
export function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.12)] ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 px-5 py-5 border-b border-[var(--border)] ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <span className="text-base font-semibold text-[var(--text)] tracking-[-0.02em]">{children}</span>
}

// ─── Input ───────────────────────────────────────────────────
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold text-[var(--text-dim)] tracking-[0.14em] uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dim)]">
            {icon}
          </span>
        )}
        <input
          className={`
            w-full bg-[color-mix(in_srgb,var(--surface-2)_94%,transparent)] border rounded-xl px-3.5 py-2.5 text-sm
            text-[var(--text)] placeholder:text-[var(--text-dim)]
            outline-none transition-all
            border-[var(--border)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-dim)]
            ${icon ? 'pl-9' : ''}
            ${error ? 'border-[var(--danger)]' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[var(--danger)]">{error}</span>}
    </div>
  )
}

// ─── Select ──────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
}

export function Select({ label, children, className = '', ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-[11px] font-bold text-[var(--text-dim)] tracking-[0.14em] uppercase">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-[color-mix(in_srgb,var(--surface-2)_94%,transparent)] border border-[var(--border)] rounded-xl px-3.5 py-2.5 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-dim)] cursor-pointer transition-all ${className}`}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

// ─── Skeleton ────────────────────────────────────────────────
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`rounded animate-pulse bg-gradient-to-r from-[var(--surface-2)] via-[var(--border)] to-[var(--surface-2)] bg-[length:200%_100%] ${className}`}
      style={{ animation: 'shimmer 1.5s infinite' }}
    />
  )
}

// ─── Table ───────────────────────────────────────────────────
export function Table({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  )
}

export function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="text-left px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[var(--text-dim)] bg-[var(--surface-2)] border-b border-[var(--border)]">
      {children}
    </th>
  )
}

export function Td({ children, mono }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td className={`px-5 py-3 border-b border-[var(--border)] text-[var(--text)] last:border-b-0 ${mono ? 'font-mono text-xs' : ''}`}>
      {children}
    </td>
  )
}

export function TrHover({ children }: { children: React.ReactNode }) {
  return (
    <tr className="hover:bg-[var(--surface-2)] transition-colors">{children}</tr>
  )
}

// ─── Empty State ─────────────────────────────────────────────
export function Empty({ message = 'Nenhum dado encontrado' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-[var(--text-dim)] text-sm">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="mb-3 opacity-40">
        <circle cx="12" cy="12" r="10" /><line x1="8" y1="12" x2="16" y2="12" />
      </svg>
      {message}
    </div>
  )
}

// ─── Mono chip ───────────────────────────────────────────────
export function ChaveNF({ chave }: { chave: string }) {
  return (
    <span className="font-mono text-xs text-[var(--text-muted)]" title={chave}>
      {chave.slice(0, 10)}…{chave.slice(-4)}
    </span>
  )
}
