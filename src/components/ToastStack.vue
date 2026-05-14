<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed bottom-4 right-4 z-[100] flex max-w-sm flex-col gap-2">
      <TransitionGroup name="toast">
        <div
          v-for="t in toast.items"
          :key="t.id"
          class="pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-soft-lg backdrop-blur-sm"
          :class="toastClass(t.variant)"
        >
          <span class="mt-0.5 shrink-0 text-lg" aria-hidden="true">{{ icon(t.variant) }}</span>
          <p class="text-sm font-medium leading-snug">{{ t.message }}</p>
          <button
            type="button"
            class="ml-auto shrink-0 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            @click="toast.dismiss(t.id)"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore, type ToastVariant } from '@/stores/toast'

const toast = useToastStore()

const toastClass = (v: ToastVariant) => {
  const map: Record<ToastVariant, string> = {
    success:
      'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100',
    error:
      'border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950/90 dark:text-red-100',
    info: 'border-slate-200 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-900/95 dark:text-slate-100',
    warning:
      'border-amber-200 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-100',
  }
  return map[v]
}

const icon = (v: ToastVariant) => {
  const map: Record<ToastVariant, string> = {
    success: '✓',
    error: '!',
    info: 'ℹ',
    warning: '⚠',
  }
  return map[v]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.25s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>
