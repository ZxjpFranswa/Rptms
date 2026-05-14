<template>
  <div v-if="!property" class="card text-center text-slate-600 dark:text-slate-400">Application not found.</div>
  <div v-else class="space-y-6">
    <div class="grid gap-6 lg:grid-cols-3">
      <div class="card lg:col-span-2 space-y-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Encoded property</h3>
        <dl class="grid gap-3 text-sm sm:grid-cols-2">
          <div><dt class="text-slate-500">PIN</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.pin }}</dd></div>
          <div><dt class="text-slate-500">Owner</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.ownerName }}</dd></div>
          <div><dt class="text-slate-500">TIN</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.ownerTIN }}</dd></div>
          <div><dt class="text-slate-500">Type</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ property.propertyType }}</dd></div>
          <div class="sm:col-span-2"><dt class="text-slate-500">Location</dt><dd class="font-medium text-slate-900 dark:text-slate-100">{{ locationLine }}</dd></div>
        </dl>
        <div v-if="property.technicalInfo" class="border-t border-slate-200 pt-4 dark:border-slate-700">
          <h4 class="mb-2 font-medium text-slate-800 dark:text-slate-200">Technical</h4>
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Boundaries N/S/E/W recorded. Measured area: {{ property.technicalInfo.areaMeasurement }} sqm.
          </p>
        </div>
        <div class="border-t border-slate-200 pt-4 dark:border-slate-700">
          <h4 class="mb-2 font-medium text-slate-800 dark:text-slate-200">Documents</h4>
          <ul class="text-sm text-slate-600 dark:text-slate-400">
            <li v-for="d in property.documents" :key="d.id">{{ d.type }} — {{ d.fileName }} ({{ d.status }})</li>
            <li v-if="!property.documents.length">No documents on file.</li>
          </ul>
        </div>
      </div>
      <div class="card space-y-4">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-white">Verification</h3>
        <ul class="space-y-2 text-sm">
          <li v-for="c in checks" :key="c.label" class="flex justify-between gap-2">
            <span class="text-slate-600 dark:text-slate-400">{{ c.label }}</span>
            <Badge :variant="c.ok ? 'success' : 'danger'">{{ c.ok ? 'Pass' : 'Fail' }}</Badge>
          </li>
        </ul>
        <div>
          <label class="label">Remarks</label>
          <textarea v-model="remarks" rows="4" class="textarea-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="Observations for the applicant…" />
        </div>
        <div class="flex flex-col gap-2">
          <button type="button" class="btn-primary" @click="pending = 'approve'; confirmOpen = true">Approve</button>
          <button type="button" class="btn-secondary" @click="pending = 'return'; confirmOpen = true">Return for correction</button>
          <button type="button" class="border border-red-300 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-800 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/50 dark:text-red-200" @click="pending = 'reject'; confirmOpen = true">Reject</button>
        </div>
      </div>
    </div>

    <Modal v-model:open="confirmOpen" :title="modalTitle" @confirm="applyDecision">
      <p class="text-sm text-slate-600 dark:text-slate-400">{{ modalBody }}</p>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import { usePropertiesStore } from '@/stores/properties'
import { useAuditLogStore } from '@/stores/auditLog'
import { useToastStore } from '@/stores/toast'

const route = useRoute()
const router = useRouter()
const propertiesStore = usePropertiesStore()
const audit = useAuditLogStore()
const toast = useToastStore()

const propertyId = computed(() => route.params.propertyId as string)
const property = computed(() => propertiesStore.getProperty(propertyId.value))

const remarks = ref('')
const confirmOpen = ref(false)
const pending = ref<'approve' | 'return' | 'reject' | null>(null)

const locationLine = computed(() => {
  const p = property.value
  if (!p) return ''
  return [p.street, p.barangay, p.municipality, p.province].filter(Boolean).join(', ')
})

const checks = computed(() => {
  const v = property.value?.verification
  return [
    { label: 'Documents complete?', ok: (property.value?.documents.length ?? 0) > 0 },
    { label: 'Ownership valid?', ok: v?.ownershipValidation === 'pass' },
    { label: 'Technical accuracy?', ok: !!property.value?.technicalInfo },
    { label: 'Exemption eligibility?', ok: v?.exemptionCheck !== 'fail' },
  ]
})

const modalTitle = computed(() => {
  if (pending.value === 'approve') return 'Approve application?'
  if (pending.value === 'return') return 'Return for correction?'
  return 'Reject application?'
})

const modalBody = computed(() => {
  if (pending.value === 'approve') return 'Property will be activated and queued for assessment / FAAS workflow.'
  if (pending.value === 'return') return 'Application will return to the assessment clerk encoding queue.'
  return 'Application will be marked rejected.'
})

const applyDecision = () => {
  const p = property.value
  const act = pending.value
  if (!p || !act) return
  propertiesStore.assessorDecision(p.id, act === 'approve' ? 'approve' : act === 'return' ? 'return' : 'reject', remarks.value)
  audit.addEntry({
    user: 'assessor',
    transactionType: `REVIEW_${act.toUpperCase()}`,
    date: new Date().toISOString(),
    previousValue: p.status,
    newValue: propertiesStore.getProperty(p.id)?.status ?? '',
    actionStatus: 'success',
  })
  toast.push(`Decision recorded: ${act}`, 'success')
  confirmOpen.value = false
  router.push('/assessor/review-queue')
}
</script>
