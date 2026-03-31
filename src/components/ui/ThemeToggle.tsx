import { useEffect, useRef, useState } from 'react'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import { useTheme, type ThemeMode } from '@/hooks/useTheme'

const OPTIONS: Array<{ mode: ThemeMode; label: string; icon: typeof Sun }> = [
  { mode: 'light', label: 'Claro', icon: Sun },
  { mode: 'system', label: 'Sistema', icon: Monitor },
  { mode: 'dark', label: 'Escuro', icon: Moon },
]

function getModeIcon(mode: ThemeMode) {
  return OPTIONS.find((option) => option.mode === mode)?.icon ?? Monitor
}

export function ThemeToggle({ modes = ['light', 'system', 'dark'] }: { modes?: ThemeMode[] }) {
  const { mode, resolvedTheme, setMode } = useTheme()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement | null>(null)
  const availableOptions = OPTIONS.filter((option) => modes.includes(option.mode))
  const fallbackMode = modes.includes(mode) ? mode : resolvedTheme
  const ActiveIcon = getModeIcon(fallbackMode)

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div ref={rootRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label="Alternar tema"
        aria-expanded={open}
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
        <ActiveIcon size={16} />
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: '160px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            boxShadow: 'var(--shadow)',
            padding: '6px',
            zIndex: 120,
          }}
        >
          {availableOptions.map(({ mode: optionMode, label, icon: Icon }) => {
            const active = mode === optionMode

            return (
              <button
                key={optionMode}
                type="button"
                onClick={() => {
                  setMode(optionMode)
                  setOpen(false)
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  border: 'none',
                  background: active ? 'var(--accent-dim)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text)',
                  borderRadius: '10px',
                  padding: '10px 12px',
                  textAlign: 'left',
                  transition: 'all var(--transition)',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '13px', fontWeight: 600 }}>
                  <Icon size={15} />
                  {label}
                </span>
                {active && <Check size={14} />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
