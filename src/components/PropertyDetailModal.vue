<template>
  <Modal
    :open="open"
    :title="title"
    size="lg"
    :show-confirm="false"
    cancel-label="Close"
    @update:open="emit('update:open', $event)"
  >
    <div v-if="property" class="space-y-4 text-sm text-slate-700 dark:text-slate-300">
      <div class="flex flex-wrap gap-2">
        <Badge :variant="getStatusVariant(property.status)">{{ getStatusLabel(property.status) }}</Badge>
        <Badge v-if="property.encodingStatus" variant="info">Encoding: {{ property.encodingStatus }}</Badge>
        <Badge v-if="property.reviewStatus" variant="info">Review: {{ property.reviewStatus }}</Badge>
      </div>
      <dl class="grid gap-3 sm:grid-cols-2">
        <div><dt class="text-xs font-semibold uppercase text-slate-500">Intake ref.</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.intakeReferenceNo }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">Application</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.applicationId }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">PIN</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.pin }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">Owner</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.ownerName }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">TIN</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.ownerTIN }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">Property type</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.propertyType }}</dd></div>
        <div class="sm:col-span-2"><dt class="text-xs font-semibold uppercase text-slate-500">Location</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ locationLine }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">Submitted</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.submissionDate }}</dd></div>
        <div><dt class="text-xs font-semibold uppercase text-slate-500">Last updated</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.lastUpdated }}</dd></div>
      </dl>
      <div v-if="property.technicalInfo" class="border-t border-slate-200 pt-3 dark:border-slate-700">
        <h4 class="mb-2 text-xs font-semibold uppercase text-slate-500">Technical</h4>
        <dl class="grid gap-2 text-xs sm:grid-cols-2">
          <div><dt class="text-slate-500">N / S / E / W</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.technicalInfo.northBoundary }} / {{ property.technicalInfo.southBoundary }} / {{ property.technicalInfo.eastBoundary }} / {{ property.technicalInfo.westBoundary }}</dd></div>
          <div><dt class="text-slate-500">Area measurement</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.technicalInfo.areaMeasurement }} sqm</dd></div>
        </dl>
      </div>
      <div v-if="property.documents?.length" class="border-t border-slate-200 pt-3 dark:border-slate-700">
        <h4 class="mb-2 text-xs font-semibold uppercase text-slate-500">Documents</h4>
        <ul class="list-inside list-disc space-y-1">
          <li v-for="d in property.documents" :key="d.id">{{ d.type }} — {{ d.fileName }} ({{ d.status }})</li>
        </ul>
      </div>
      <div v-if="property.verification" class="border-t border-slate-200 pt-3 dark:border-slate-700">
        <h4 class="mb-2 text-xs font-semibold uppercase text-slate-500">Verification snapshot</h4>
        <div class="grid gap-2 sm:grid-cols-2">
          <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <span>Duplicate</span>
            <Badge :variant="vBadge(property.verification.duplicateCheck)">{{ property.verification.duplicateCheck }}</Badge>
          </div>
          <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <span>Ownership</span>
            <Badge :variant="vBadge(property.verification.ownershipValidation)">{{ property.verification.ownershipValidation }}</Badge>
          </div>
          <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <span>Consistency</span>
            <Badge :variant="vBadge(property.verification.consistencyCheck)">{{ property.verification.consistencyCheck }}</Badge>
          </div>
          <div class="flex justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800/80">
            <span>Overall</span>
            <Badge :variant="property.verification.overallStatus === 'passed' ? 'success' : 'danger'">
              {{ property.verification.overallStatus }}
            </Badge>
          </div>
        </div>
      </div>
    </div>
    <p v-else class="text-sm text-slate-500">No property data.</p>
  </Modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Modal from '@/components/Modal.vue'
import Badge from '@/components/Badge.vue'
import { usePropertiesStore } from '@/stores/properties'

const props = defineProps<{
  open: boolean
  propertyId: string | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const store = usePropertiesStore()

const property = computed(() => (props.propertyId ? store.getProperty(props.propertyId) : undefined))

const title = computed(() =>
  property.value ? `Intake ${property.value.intakeReferenceNo}` : 'Property details',
)

const locationLine = computed(() => {
  const p = property.value
  if (!p) return ''
  return [p.street, p.barangay, p.municipality, p.province].filter(Boolean).join(', ')
})

const getStatusVariant = (status: string) => {
  const m: Record<string, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
    pending: 'info',
    encoding: 'warning',
    verified: 'success',
    reviewed: 'info',
    active: 'success',
    rejected: 'danger',
  }
  return m[status] || 'default'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: 'Pending',
    encoding: 'Encoding',
    verified: 'Verified',
    reviewed: 'Reviewed',
    active: 'Active',
    rejected: 'Rejected',
  }
  return labels[status] || status
}

const vBadge = (v: string) => {
  if (v === 'pass') return 'success' as const
  if (v === 'fail') return 'danger' as const
  return 'info' as const
}
</script>
