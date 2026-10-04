<template>
  <Dialog :open="open" class="relative z-50" @close="$emit('cancel')">
    <div class="fixed inset-0 bg-black/40" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <DialogTitle class="text-lg font-bold text-gray-900">{{ title }}</DialogTitle>
        <p class="mt-3 text-sm text-gray-600">{{ message }}</p>
        <p v-if="detail" class="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3">
          {{ detail }}
        </p>
        <div class="mt-6 flex gap-3 justify-end">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            @click="$emit('cancel')"
          >
            Cancel
          </button>
          <button
            type="button"
            :class="[
              'px-4 py-2 text-sm font-semibold text-white rounded-lg',
              confirmVariant === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-700 hover:bg-primary-800',
            ]"
            @click="$emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'

interface Props {
  open: boolean
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  confirmVariant?: 'primary' | 'danger'
}

withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  confirmVariant: 'primary',
})

defineEmits<{
  confirm: []
  cancel: []
}>()
</script>
