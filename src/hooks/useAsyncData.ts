import {
  useCallback,
  useEffect,
  useState,
  type DependencyList,
} from 'react'
import type { ApiResult } from '@/types'

export interface AsyncDataState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
}

export interface UseAsyncDataOptions<T> {
  enabled?: boolean
  initialData?: T | null
}

export interface UseAsyncDataReturn<T> extends AsyncDataState<T> {
  reload: () => Promise<void>
}

export function useAsyncData<T>(
  fetcher: () => Promise<ApiResult<T>>,
  deps: DependencyList,
  options: UseAsyncDataOptions<T> = {},
): UseAsyncDataReturn<T> {
  const { enabled = true, initialData = null } = options
  const [data, setData] = useState<T | null>(initialData)
  const [isLoading, setIsLoading] = useState(enabled)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!enabled) return

    setIsLoading(true)
    setError(null)

    const result = await fetcher()
    if (result.error) {
      setError(result.error.message)
      setIsLoading(false)
      return
    }

    setData(result.data)
    setIsLoading(false)
  }, [enabled, fetcher])

  useEffect(() => {
    if (!enabled) return

    let cancelled = false

    const run = async () => {
      setIsLoading(true)
      setError(null)

      const result = await fetcher()
      if (cancelled) return

      if (result.error) {
        setError(result.error.message)
        setIsLoading(false)
        return
      }

      setData(result.data)
      setIsLoading(false)
    }

    void run()

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- caller controls invalidation via deps
  }, [...deps, enabled, fetcher])

  return {
    data,
    isLoading: enabled && isLoading,
    error,
    reload,
  }
}
