<template>
  <Dialog :open="open" class="relative z-50" @close="$emit('close')">
    <div class="fixed inset-0 bg-black/40" aria-hidden="true" />
    <div class="fixed inset-0 flex items-center justify-center p-4">
      <DialogPanel class="w-full max-w-3xl rounded-xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
        <div class="p-6 border-b border-gray-200 flex-shrink-0">
          <DialogTitle class="text-lg font-bold text-gray-900">Upload Missing Documents</DialogTitle>
          <p v-if="property" class="text-sm text-gray-600 mt-1">
            {{ property.intakeRef }} — {{ property.taxpayerName }}
          </p>
          <p
            v-if="property?.remarks && property.status === 'Returned'"
            class="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
          >
            Assessor note: {{ property.remarks }}
          </p>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <DocumentUploadTable v-model="localDocs" :application-id="property?.id" />
        </div>

        <div class="p-6 border-t border-gray-200 flex justify-end gap-3 flex-shrink-0">
          <button
            type="button"
            class="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            @click="$emit('close')"
          >
            Close
          </button>
          <button
            type="button"
            class="px-4 py-2 text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 rounded-lg"
            @click="saveAndClose"
          >
            Save Documents
          </button>
        </div>
      </DialogPanel>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/vue'
import type { PropertyApplication, PropertyDocument } from '@/stores/property'
import { usePropertyStore } from '@/stores/property'
import DocumentUploadTable from '@/components/forms/DocumentUploadTable.vue'
import { createEmptyDocuments, countUploadedDocuments } from '@/utils/documents'

interface Props {
  open: boolean
  property: PropertyApplication | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  saved: [message: string]
}>()

const propertyStore = usePropertyStore()
const localDocs = ref<PropertyDocument[]>(createEmptyDocuments())

const mergeDocuments = (property: PropertyApplication | null) => {
  const empty = createEmptyDocuments()
  if (!property?.documents?.length) {
    localDocs.value = empty
    return
  }
  localDocs.value = empty.map((slot) => {
    const existing = property.documents!.find((d) => d.type === slot.type)
    return existing ? { ...slot, ...existing, previewUrl: undefined } : slot
  })
}

watch(
  () => props.property,
  (p) => mergeDocuments(p),
  { immediate: true },
)

const saveAndClose = async () => {
  if (!props.property) return

  await propertyStore.fetchRegistrationById(props.property.id)
  const count = countUploadedDocuments(localDocs.value)
  emit('saved', `${count} document(s) saved successfully.`)
  emit('close')
}
</script>
