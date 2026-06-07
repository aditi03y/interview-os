import { useEffect, useRef, useState } from 'react'
import { Input, type InputProps } from './Input'

export interface DraftNumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number
  onChange: (value: number) => void
  /** Applied on blur when the field is empty or invalid */
  emptyValue?: number
  min?: number
  max?: number
}

function clamp(value: number, min?: number, max?: number): number {
  let next = value
  if (min != null) next = Math.max(min, next)
  if (max != null) next = Math.min(max, next)
  return next
}

function parseDraft(raw: string, step?: number | string): number | null {
  if (raw === '' || raw === '-' || raw === '.') return null
  const useFloat = step != null && !Number.isInteger(Number(step))
  const parsed = useFloat ? parseFloat(raw) : Number(raw)
  if (!Number.isFinite(parsed)) return null
  return parsed
}

export function DraftNumberInput({
  value,
  onChange,
  emptyValue = 0,
  min,
  max,
  step,
  onBlur,
  onFocus,
  ...props
}: DraftNumberInputProps) {
  const [draft, setDraft] = useState(String(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(String(value))
    }
  }, [value])

  const commit = (raw: string) => {
    const parsed = parseDraft(raw, step)
    const next = parsed == null ? emptyValue : clamp(parsed, min, max)
    onChange(next)
    setDraft(String(next))
  }

  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true
        onFocus?.(e)
      }}
      onBlur={(e) => {
        focusedRef.current = false
        commit(e.target.value)
        onBlur?.(e)
      }}
      onChange={(e) => setDraft(e.target.value)}
    />
  )
}

export interface DraftNullableNumberInputProps extends Omit<InputProps, 'value' | 'onChange' | 'type'> {
  value: number | null
  onChange: (value: number | null) => void
  min?: number
  max?: number
}

export function DraftNullableNumberInput({
  value,
  onChange,
  min,
  max,
  step,
  onBlur,
  onFocus,
  ...props
}: DraftNullableNumberInputProps) {
  const [draft, setDraft] = useState(value == null ? '' : String(value))
  const focusedRef = useRef(false)

  useEffect(() => {
    if (!focusedRef.current) {
      setDraft(value == null ? '' : String(value))
    }
  }, [value])

  const commit = (raw: string) => {
    const parsed = parseDraft(raw, step)
    if (parsed == null) {
      onChange(null)
      setDraft('')
      return
    }
    const next = clamp(parsed, min, max)
    onChange(next)
    setDraft(String(next))
  }

  return (
    <Input
      {...props}
      type="number"
      min={min}
      max={max}
      step={step}
      value={draft}
      onFocus={(e) => {
        focusedRef.current = true
        onFocus?.(e)
      }}
      onBlur={(e) => {
        focusedRef.current = false
        commit(e.target.value)
        onBlur?.(e)
      }}
      onChange={(e) => setDraft(e.target.value)}
    />
  )
}
