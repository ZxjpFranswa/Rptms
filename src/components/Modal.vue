<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto">
        <div class="fixed inset-0 bg-black/50" @click="close" />
        <div
          :class="panelClass"
          class="relative w-full rounded-xl bg-white p-6 shadow-soft-lg dark:border dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 m-4 max-h-[90vh] overflow-y-auto"
        >
          <button
            @click="close"
            class="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div v-if="title" class="mb-4">
            <h2 class="text-xl font-semibold text-slate-900 dark:text-white">{{ title }}</h2>
          </div>

          <div class="mb-6">
            <slot />
          </div>

          <div v-if="showFooter" class="flex gap-3 justify-end">
            <button @click="close" class="btn-secondary btn-sm">
              {{ cancelLabel }}
            </button>
            <button
              @click="confirm"
              class="btn-primary btn-sm"
              v-if="showConfirm"
            >
              {{ confirmLabel }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  open: boolean
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  showConfirm?: boolean
  showFooter?: boolean
  /** Panel max width */
  size?: 'md' | 'lg' | 'xl'
}

interface Emits {
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  showConfirm: true,
  showFooter: true,
  size: 'md',
})

const emit = defineEmits<Emits>()

const panelClass = computed(() => {
  const map = {
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }
  return map[props.size]
})

const isOpen = computed({
  get: () => props.open,
  set: (value) => emit('update:open', value),
})

const close = () => {
  isOpen.value = false
}

const confirm = () => {
  emit('confirm')
  close()
}
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
