import { create } from 'zustand'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  title?: string
  message: string
  variant: ToastVariant
  duration: number
}

interface ToastInput {
  title?: string
  message: string
  variant?: ToastVariant
  duration?: number
}

interface ToastStore {
  toasts: Toast[]
  add: (input: ToastInput) => string
  dismiss: (id: string) => void
}

const DEFAULT_DURATION: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
}

const MAX_TOASTS = 5

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (input) => {
    const variant = input.variant ?? 'info'
    const toast: Toast = {
      id: crypto.randomUUID(),
      title: input.title,
      message: input.message,
      variant,
      duration: input.duration ?? DEFAULT_DURATION[variant],
    }

    set((state) => ({
      toasts: [toast, ...state.toasts].slice(0, MAX_TOASTS),
    }))

    return toast.id
  },

  dismiss: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
}))

export function showToast(input: ToastInput): string {
  return useToastStore.getState().add(input)
}
