import React from 'react'

// ─── Button ──────────────────────────────────────────────────
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
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
  const base = 'inline-flex items-center gap-1.5 font-medium rounded-lg border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none'

  const variants = {
    primary: 'bg-[var(--accent)] text-black border-transparent hover:brightness-110 active:brightness-90',
    ghost: 'bg-[var(--surface-2)] text-[var(--text)] border-[var(--border)] hover:border-[var(--border-bright)] hover:bg-[var(--border)]',
    danger: 'bg-[var(--danger-dim)] text-[var(--danger)] border-[var(--danger-dim)] hover:bg-[var(--danger)] hover:text-white',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
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
  gray:   'bg-[rgba(107,125,143,0.1)] text-[var(--text-muted)]',
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
    <div className={`bg-[var(--surface)] border border-[var(--border)] rounded-lg overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between px-5 py-4 border-b border-[var(--border)] ${className}`}>
      {children}
    </div>
  )
}

export function CardTitle({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-semibold text-[var(--text)]">{children}</span>
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
        <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">
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
            w-full bg-[var(--surface-2)] border rounded-lg px-3 py-2 text-sm
            text-[var(--text)] placeholder:text-[var(--text-dim)]
            outline-none transition-colors
            border-[var(--border)] focus:border-[var(--accent)]
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
        <label className="text-xs font-semibold text-[var(--text-muted)] tracking-wide uppercase">
          {label}
        </label>
      )}
      <select
        className={`w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--accent)] cursor-pointer ${className}`}
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
    <div className="overflow-x-auto">
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
    <td className={`px-5 py-3 border-b border-[var(--border)] text-[var(--text-muted)] last:border-b-0 ${mono ? 'font-mono text-xs' : ''}`}>
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
