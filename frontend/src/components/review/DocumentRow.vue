<template>
  <div
    class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition gap-4"
  >
    <div class="flex items-center gap-4 min-w-0">
      <div
        :class="[
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          iconBgClass,
        ]"
      >
        <DocumentIcon class="w-5 h-5" :class="iconClass" />
      </div>
      <div class="min-w-0">
        <p class="font-semibold text-gray-900">{{ document.type }}</p>
        <p class="text-sm text-gray-600 truncate">
          {{ document.fileName || 'No file uploaded' }}
        </p>
        <p v-if="document.fileSize" class="text-xs text-gray-400 mt-0.5">
          {{ formatFileSize(document.fileSize) }}
          <span v-if="document.uploadedAt">
            · {{ formatDate(document.uploadedAt) }}
          </span>
        </p>
      </div>
    </div>

    <div class="flex items-center gap-2 flex-shrink-0">
      <button
        v-if="viewable"
        type="button"
        title="View document"
        aria-label="View document"
        class="p-2 text-primary-700 hover:bg-primary-100 rounded-lg transition border border-transparent hover:border-primary-200"
        @click="$emit('view', document)"
      >
        <EyeIcon class="w-5 h-5" />
      </button>
      <span
        :class="[
          'px-2.5 py-1 rounded-full text-xs font-semibold',
          statusBadgeClass(document.uploadStatus),
        ]"
      >
        {{ document.uploadStatus }}
      </span>
      <button
        v-if="showVerify && document.uploadStatus === 'Uploaded'"
        type="button"
        class="px-3 py-1.5 text-sm text-green-700 font-medium hover:bg-green-50 rounded-lg transition"
        @click="$emit('verify', document)"
      >
        Verify
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DocumentIcon, EyeIcon } from '@heroicons/vue/24/outline'
import type { PropertyDocument } from '@/stores/property'
import { formatFileSize, isDocumentViewable } from '@/utils/documents'

interface Props {
  document: PropertyDocument
  showVerify?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showVerify: false,
})

defineEmits<{
  view: [doc: PropertyDocument]
  verify: [doc: PropertyDocument]
}>()

const viewable = computed(() => isDocumentViewable(props.document))

const statusBadgeClass = (status: string) => {
  if (status === 'Verified') return 'bg-green-100 text-green-800'
  if (status === 'Uploaded') return 'bg-blue-100 text-blue-800'
  if (status === 'Rejected') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const iconBgClass = computed(() => {
  if (props.document.uploadStatus === 'Verified') return 'bg-green-100'
  if (props.document.uploadStatus === 'Uploaded') return 'bg-blue-100'
  return 'bg-gray-100'
})

const iconClass = computed(() => {
  if (props.document.uploadStatus === 'Verified') return 'text-green-700'
  if (props.document.uploadStatus === 'Uploaded') return 'text-blue-700'
  return 'text-gray-500'
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
</script>
