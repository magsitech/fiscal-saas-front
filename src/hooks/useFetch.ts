import { useEffect, useState, useCallback } from 'react'

// Hook genérico para carregamento de dados.
export function useFetch<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = [],
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetcher()
      setData(result)
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load() }, [load])

  return { data, loading, error, reload: load }
}

// Hook de polling para acompanhar mudanças de status.
export function usePolling<T>(
  fetcher: () => Promise<T>,
  shouldStop: (data: T) => boolean,
  intervalMs = 2000,
) {
  const [data, setData] = useState<T | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function tick() {
      try {
        const result = await fetcher()
        if (!cancelled) {
          setData(result)
          if (shouldStop(result)) {
            setDone(true)
            return
          }
          setTimeout(tick, intervalMs)
        }
      } catch {
        if (!cancelled) setTimeout(tick, intervalMs * 2)
      }
    }

    tick()
    return () => { cancelled = true }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { data, done }
}
