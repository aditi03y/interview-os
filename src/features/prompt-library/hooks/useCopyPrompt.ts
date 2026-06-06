import { useCallback, useState } from 'react'

export function useCopyPrompt() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyPrompt = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      return true
    } catch {
      return false
    }
  }, [])

  return { copiedId, copyPrompt }
}
