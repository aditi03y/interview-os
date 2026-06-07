import { showToast } from '@/stores/toastStore'

export const toast = {
  success(message: string, title?: string, duration?: number) {
    return showToast({ message, title, variant: 'success', duration })
  },

  error(message: string, title?: string, duration?: number) {
    return showToast({ message, title, variant: 'error', duration })
  },

  info(message: string, title?: string, duration?: number) {
    return showToast({ message, title, variant: 'info', duration })
  },

  warning(message: string, title?: string, duration?: number) {
    return showToast({ message, title, variant: 'warning', duration })
  },
}
