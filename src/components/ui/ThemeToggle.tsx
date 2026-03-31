import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

export function ThemeToggle() {
  const { mode, setMode } = useTheme()
  const isDark = mode === 'dark'
  const Icon = isDark ? Moon : Sun

  return (
    <button
      type="button"
      onClick={() => setMode(isDark ? 'light' : 'dark')}
      aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      title={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--border)',
        borderRadius: '999px',
        background: 'transparent',
        color: 'var(--text-muted)',
        width: '38px',
        height: '38px',
        transition: 'all var(--transition)',
      }}
    >
      <Icon size={16} />
    </button>
  )
}
