import { useEffect, useState } from 'react'

export type ThemeMode = 'light' | 'dark'

const STORAGE_KEY = 'validaenota-theme-mode'

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode
  document.documentElement.dataset.themeMode = mode
  document.documentElement.style.colorScheme = mode
}

export function useTheme() {
  const [mode, setMode] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'dark'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored === 'light' || stored === 'dark' ? stored : 'dark'
  })

  useEffect(() => {
    applyTheme(mode)
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  return {
    mode,
    setMode,
  }
}

export function initializeTheme() {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  const mode: ThemeMode = stored === 'light' || stored === 'dark' ? stored : 'dark'
  applyTheme(mode)
}
