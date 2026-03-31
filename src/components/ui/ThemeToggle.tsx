import { Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'

const OPTIONS: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
  { mode: 'light', label: 'Claro', icon: Sun },
  { mode: 'system', label: 'Sistema', icon: Monitor },
  { mode: 'dark', label: 'Escuro', icon: Moon },
]

export function ThemeToggle() {
  const { mode, setMode } = useTheme()

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '4px',
        borderRadius: '999px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
      }}
    >
      {OPTIONS.map(({ mode: optionMode, label, icon: Icon }) => {
        const active = mode === optionMode

        return (
          <button
            key={optionMode}
            type="button"
            onClick={() => setMode(optionMode)}
            title={label}
            aria-label={`Ativar tema ${label.toLowerCase()}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              borderRadius: '999px',
              padding: '7px 10px',
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              transition: 'all var(--transition)',
            }}
          >
            <Icon size={14} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}
