import { useCallback, useState } from 'react'
import { toast } from '@/lib/toast'

export function useCopyPrompt() {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const copyPrompt = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
      toast.success('Prompt copied to clipboard.')
      return true
    } catch {
      toast.error('Could not copy to clipboard.', 'Copy failed')
      return false
    }
  }, [])

  return { copiedId, copyPrompt }
}
