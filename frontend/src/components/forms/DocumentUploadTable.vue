<template>
  <div class="space-y-4">
    <div
      v-if="!readonly"
      class="border-2 border-dashed rounded-xl p-8 text-center transition"
      :class="
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-gray-300 hover:border-primary-400 bg-gray-50/50'
      "
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onBulkDrop"
    >
      <ArrowUpTrayIcon class="w-10 h-10 mx-auto text-gray-400 mb-3" />
      <p class="font-semibold text-gray-900">Drag and drop files here</p>
      <p class="text-sm text-gray-600 mt-1">PDF, JPG, PNG — max 10MB per file</p>
      <p class="text-xs text-gray-500 mt-2">
        Files are matched to the first pending document type in the list
      </p>
    </div>

    <p v-if="uploadError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
      {{ uploadError }}
    </p>

    <div class="overflow-x-auto rounded-xl border border-gray-200">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-4 py-3 text-left font-semibold text-gray-700">Document Type</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700">File</th>
            <th class="px-4 py-3 text-left font-semibold text-gray-700">Upload Status</th>
            <th class="px-4 py-3 text-right font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 bg-white">
          <tr
            v-for="(doc, index) in model"
            :key="doc.type"
            class="transition"
            :class="dragOverIndex === index ? 'bg-primary-50' : 'hover:bg-gray-50'"
            @dragover.prevent="onRowDragOver(index)"
            @dragleave="dragOverIndex = null"
            @drop.prevent="onRowDrop(index, $event)"
          >
            <td class="px-4 py-3">
              <span class="font-medium text-gray-900">{{ doc.type }}</span>
              <span
                v-if="isRequired(doc.type)"
                class="ml-1 text-red-500"
                title="Required"
              >*</span>
            </td>
            <td class="px-4 py-3 text-gray-600 max-w-[200px]">
              <span class="truncate block" :title="doc.fileName">
                {{ doc.fileName || '—' }}
              </span>
              <span v-if="doc.fileSize" class="text-xs text-gray-400">
                {{ formatFileSize(doc.fileSize) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                :class="[
                  'inline-block px-2.5 py-1 rounded-full text-xs font-semibold',
                  statusClass(doc.uploadStatus),
                ]"
              >
                {{ doc.uploadStatus }}
              </span>
            </td>
            <td class="px-4 py-3 text-right">
              <div class="flex items-center justify-end gap-2">
                <button
                  v-if="isDocumentViewable(doc)"
                  type="button"
                  title="View document"
                  aria-label="View document"
                  class="p-1.5 text-primary-700 hover:bg-primary-100 rounded-lg transition"
                  @click="openPreview(doc)"
                >
                  <EyeIcon class="w-5 h-5" />
                </button>
                <template v-if="!readonly">
                  <label
                    v-if="doc.uploadStatus === 'Pending' || doc.uploadStatus === 'Uploaded'"
                    class="cursor-pointer text-sm text-primary-700 font-medium hover:underline"
                  >
                    {{ doc.fileName ? 'Replace' : 'Upload' }}
                    <input
                      type="file"
                      class="hidden"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      @change="onFileInput(doc.type, $event)"
                    />
                  </label>
                  <button
                    v-if="doc.fileName"
                    type="button"
                    class="text-sm text-red-600 font-medium hover:underline"
                    @click="removeFile(index)"
                  >
                    Remove
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
      <span>
        {{ uploadedCount }} of {{ model.length }} documents uploaded
      </span>
      <span v-if="missingRequired.length" class="text-amber-700 font-medium">
        Required missing: {{ missingRequired.join(', ') }}
      </span>
    </div>

    <DocumentPreviewModal
      :open="!!previewDoc"
      :document="previewDoc"
      @close="previewDoc = null"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'
import { ArrowUpTrayIcon, EyeIcon } from '@heroicons/vue/24/outline'
import type { PropertyDocument } from '@/stores/property'
import { REQUIRED_DOCUMENT_TYPES } from '@/constants/documents'
import {
  validateDocumentFile,
  formatFileSize,
  applyFileToDocument,
  clearDocumentFile,
  countUploadedDocuments,
  missingRequiredDocuments,
  isDocumentViewable,
  documentForViewer,
} from '@/utils/documents'
import DocumentPreviewModal from '@/components/review/DocumentPreviewModal.vue'

interface Props {
  readonly?: boolean
  applicationId?: string
}

const props = withDefaults(defineProps<Props>(), {
  readonly: false,
  applicationId: undefined,
})

const model = defineModel<PropertyDocument[]>({ required: true })

const isDragging = ref(false)
const dragOverIndex = ref<number | null>(null)
const uploadError = ref('')
const previewDoc = ref<PropertyDocument | null>(null)

const uploadedCount = computed(() => countUploadedDocuments(model.value))
const missingRequired = computed(() => missingRequiredDocuments(model.value))

const isRequired = (type: string) =>
  REQUIRED_DOCUMENT_TYPES.includes(type as (typeof REQUIRED_DOCUMENT_TYPES)[number])

const statusClass = (status: string) => {
  if (status === 'Verified') return 'bg-green-100 text-green-800'
  if (status === 'Uploaded') return 'bg-blue-100 text-blue-800'
  if (status === 'Rejected') return 'bg-red-100 text-red-800'
  return 'bg-gray-100 text-gray-800'
}

const openPreview = async (doc: PropertyDocument) => {
  previewDoc.value = await documentForViewer(doc)
}

const assignFile = async (type: string, file: File) => {
  uploadError.value = ''
  const err = validateDocumentFile(file)
  if (err) {
    uploadError.value = err
    return
  }

  const index = model.value.findIndex((d) => d.type === type)
  if (index === -1) {
    uploadError.value = `Unknown document type: ${type}`
    return
  }

  try {
    const updated = [...model.value]
    updated[index] = await applyFileToDocument(updated[index], file, props.applicationId)
    model.value = updated
  } catch (e: unknown) {
    uploadError.value = e instanceof Error ? e.message : 'Upload failed. Please try again.'
  }
}

const assignFileToNextPending = (file: File) => {
  const pending = model.value.find((d) => d.uploadStatus === 'Pending')
  if (pending) {
    assignFile(pending.type, file)
    return
  }
  const first = model.value[0]
  if (first) assignFile(first.type, file)
}

const onFileInput = (type: string, event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) assignFile(type, file)
  input.value = ''
}

const onRowDragOver = (index: number) => {
  dragOverIndex.value = index
}

const onRowDrop = (index: number, event: DragEvent) => {
  dragOverIndex.value = null
  isDragging.value = false
  const file = event.dataTransfer?.files?.[0]
  if (!file) return
  assignFile(model.value[index].type, file)
}

const onBulkDrop = (event: DragEvent) => {
  isDragging.value = false
  const files = event.dataTransfer?.files
  if (!files?.length) return

  Array.from(files).forEach((file, i) => {
    const pending = model.value.filter((d) => d.uploadStatus === 'Pending')
    const target = pending[i]
    if (target) assignFile(target.type, file)
    else if (i === 0) assignFileToNextPending(file)
  })
}

const removeFile = (index: number) => {
  const updated = [...model.value]
  updated[index] = clearDocumentFile(updated[index])
  model.value = updated
}

onBeforeUnmount(() => {
  model.value.forEach((d) => {
    if (d.previewUrl) URL.revokeObjectURL(d.previewUrl)
  })
})
</script>
