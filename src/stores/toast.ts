import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'info' | 'warning'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

let seq = 0

export const useToastStore = defineStore('toast', () => {
  const items = ref<ToastItem[]>([])

  const push = (message: string, variant: ToastVariant = 'info') => {
    const id = ++seq
    items.value.push({ id, message, variant })
    window.setTimeout(() => dismiss(id), 4800)
  }

  const dismiss = (id: number) => {
    items.value = items.value.filter((t) => t.id !== id)
  }

  return { items, push, dismiss }
})
