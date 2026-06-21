<template>
  <Dialog :open="open" class="relative z-[60]" @close="$emit('close')">
    <div class="fixed inset-0 bg-black/50" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel
        class="w-full max-w-4xl max-h-[90vh] rounded-xl bg-white shadow-xl overflow-hidden flex flex-col"
      >
        <div class="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
          <div class="min-w-0">
            <DialogTitle class="text-lg font-bold text-gray-900">{{ document?.type }}</DialogTitle>
            <p class="text-sm text-gray-600 truncate">{{ document?.fileName }}</p>
            <p v-if="document?.fileSize" class="text-xs text-gray-400 mt-0.5">
              {{ formatFileSize(document.fileSize) }}
            </p>
          </div>
          <div class="flex items-center gap-2 flex-shrink-0">
            <a
              v-if="viewUrl"
              :href="viewUrl"
              :download="document?.fileName"
              class="px-3 py-1.5 text-sm font-medium text-primary-700 border border-primary-200 rounded-lg hover:bg-primary-50"
            >
              Download
            </a>
            <button
              type="button"
              class="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
              @click="$emit('close')"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          class="flex-1 overflow-auto p-4 bg-gray-100 min-h-[280px] flex items-center justify-center"
        >
          <img
            v-if="isImage && viewUrl"
            :src="viewUrl"
            :alt="document?.fileName"
            class="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg bg-white"
          />
          <iframe
            v-else-if="isPdf && viewUrl"
            :src="viewUrl"
            class="w-full h-[75vh] rounded-lg border border-gray-200 bg-white shadow-lg"
            title="Document viewer"
          />
          <div v-else class="text-center text-gray-500 p-8 bg-white rounded-xl shadow-sm max-w-md">
            <DocumentIcon class="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p class="font-medium text-gray-900">Cannot display this file</p>
            <p class="text-sm mt-2 text-gray-600">
              {{ document?.fileName || 'No file attached' }}
            </p>
            <p class="text-xs mt-2 text-gray-400">
              Supported viewers: PDF, JPG, PNG
            </p>
          </div>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import { DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'
import type { PropertyDocument } from '@/stores/property'
import { formatFileSize, resolveDocumentViewUrl, inferMimeType } from '@/utils/documents'

interface Props {
  open: boolean
  document: PropertyDocument | null
}

const props = defineProps<Props>()
defineEmits<{ close: [] }>()

const viewUrl = ref<string | undefined>()

watch(
  () => [props.open, props.document] as const,
  async ([open, doc]) => {
    if (viewUrl.value?.startsWith('blob:')) {
      URL.revokeObjectURL(viewUrl.value)
    }
    viewUrl.value = undefined
    if (open && doc) {
      viewUrl.value = await resolveDocumentViewUrl(doc)
    }
  },
  { immediate: true },
)

const resolvedMime = computed(() =>
  props.document
    ? inferMimeType(props.document.fileName, props.document.mimeType)
    : undefined,
)

const isImage = computed(() => resolvedMime.value?.startsWith('image/'))
const isPdf = computed(() => resolvedMime.value === 'application/pdf')
</script>
