import { useEffect, useState } from 'react'

export type ThemeMode = 'system' | 'light' | 'dark'
type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'validaenota-theme-mode'

function getSystemTheme(): ResolvedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  return mode === 'system' ? getSystemTheme() : mode
}

function applyTheme(mode: ThemeMode) {
  const resolved = resolveTheme(mode)
  document.documentElement.dataset.theme = resolved
  document.documentElement.dataset.themeMode = mode
  document.documentElement.style.colorScheme = resolved
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark'
  })

  useEffect(() => {
    applyTheme(mode)
    window.localStorage.setItem(STORAGE_KEY, mode)

    if (mode !== 'system') return

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme('system')

    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [mode])

  return {
    mode,
    resolvedTheme: resolveTheme(mode),
    setMode,
  }
}

export function initializeTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  const mode: ThemeMode = stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'dark'
  applyTheme(mode)
}
