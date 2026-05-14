<template>
  <div class="space-y-4">
    <div class="card border border-amber-200 bg-amber-50/80 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
      Preconditions: property <strong>ACTIVE</strong>, assessment <strong>completed</strong>, unique PIN. Duplicate FAAS generation is blocked client-side.
    </div>
    <div class="card">
      <DataTable :data="rows" :columns="columns" :page-size="8">
        <template #cell-releaseStatus="{ row }">
          <Badge :variant="row.faas?.releaseStatus === 'released' ? 'success' : 'warning'">
            {{ row.faas?.releaseStatus ?? 'none' }}
          </Badge>
        </template>
        <template #cell-assessedValue="{ row }">
          {{ formatMoney(row.assessment?.assessedValue ?? 0) }}
        </template>
        <template #row-actions="{ row }">
          <div class="flex flex-wrap justify-end gap-2">
            <button
              v-if="!row.faas"
              type="button"
              class="text-sm font-medium text-emerald-600 hover:text-emerald-700"
              @click="gen(row)"
            >
              Generate FAAS
            </button>
            <button
              v-if="row.faas"
              type="button"
              class="text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-300"
              @click="preview(row)"
            >
              Preview
            </button>
            <button
              v-if="row.faas && row.faas.releaseStatus === 'pending'"
              type="button"
              class="text-sm font-medium text-blue-600 hover:text-blue-700"
              @click="openReleaseConfirm(row)"
            >
              Release
            </button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>

  <Modal v-model:open="previewOpen" title="FAAS document preview" size="lg" :show-confirm="false" cancel-label="Close">
    <div v-if="previewRow?.faas" class="space-y-3 text-sm text-slate-700 dark:text-slate-300">
      <p class="rounded-lg border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-800/80">
        FAAS No. {{ previewRow.faas.faasNumber }} · PIN {{ previewRow.pin }} · Owner {{ previewRow.ownerName }} · Assessed value
        {{ formatMoney(previewRow.assessment?.assessedValue ?? 0) }} · Generated {{ previewRow.faas.generationDate }}
      </p>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        PDF rendering would run here (e.g. embed <code>blob:</code> URL from <code>GET /faas/:id/pdf</code>).
      </p>
    </div>
    <p v-else class="text-sm text-slate-500">Generate a FAAS first to preview.</p>
  </Modal>

  <Modal v-model:open="releaseConfirmOpen" title="Release FAAS?" confirm-label="Release to clerk" @confirm="confirmRelease">
    <p v-if="releaseRow?.faas" class="text-sm text-slate-600 dark:text-slate-400">
      Release <strong>{{ releaseRow.faas.faasNumber }}</strong> for PIN <strong>{{ releaseRow.pin }}</strong>? This will publish the record to
      <strong>Assessment Clerk → Released FAAS</strong>.
    </p>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import { usePropertiesStore, type Property } from '@/stores/properties'
import { useAuditLogStore } from '@/stores/auditLog'
import { useToastStore } from '@/stores/toast'

const propertiesStore = usePropertiesStore()
const audit = useAuditLogStore()
const toast = useToastStore()

type FaasRow = Property & {
  faasNumber: string
  assessmentId: string
  generationDate: string
  releaseStatus: string
  releasedBy: string
}

const rows = computed<FaasRow[]>(() =>
  propertiesStore.properties
    .filter((p) => p.status === 'active' && p.assessment?.status === 'completed')
    .map((p) => ({
      ...p,
      faasNumber: p.faas?.faasNumber ?? '—',
      assessmentId: p.assessment?.id ?? '—',
      generationDate: p.faas?.generationDate ?? '—',
      releaseStatus: p.faas?.releaseStatus ?? 'none',
      releasedBy: p.faas?.releasedBy ?? '—',
    })),
)

const columns = [
  { key: 'faasNumber', label: 'FAAS Number' },
  { key: 'pin', label: 'Property PIN' },
  { key: 'assessmentId', label: 'Assessment ID' },
  { key: 'generationDate', label: 'Generation Date' },
  { key: 'releaseStatus', label: 'Release Status' },
  { key: 'releasedBy', label: 'Released By' },
  { key: 'assessedValue', label: 'Assessed Value' },
]

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)

const gen = (row: FaasRow) => {
  const res = propertiesStore.generateFaas(row.id)
  if (!res.ok) {
    toast.push(res.message, 'error')
    return
  }
  const faas = propertiesStore.getProperty(row.id)?.faas
  audit.addEntry({
    user: 'assessor',
    transactionType: 'FAAS_GENERATE',
    date: new Date().toISOString(),
    previousValue: 'none',
    newValue: faas?.faasNumber ?? 'created',
    actionStatus: 'success',
  })
  toast.push('FAAS generated.', 'success')
}

const previewOpen = ref(false)
const previewRow = ref<FaasRow | null>(null)
const releaseConfirmOpen = ref(false)
const releaseRow = ref<FaasRow | null>(null)

const preview = (row: FaasRow) => {
  previewRow.value = row
  previewOpen.value = true
  if (row.faas) {
    toast.push('Preview panel opened.', 'info')
  }
}

const openReleaseConfirm = (row: FaasRow) => {
  releaseRow.value = row
  releaseConfirmOpen.value = true
}

const confirmRelease = () => {
  const row = releaseRow.value
  if (!row) return
  doRelease(row)
  releaseConfirmOpen.value = false
}

const doRelease = (row: FaasRow) => {
  propertiesStore.releaseFAAS(row.id)
  audit.addEntry({
    user: 'assessor',
    transactionType: 'FAAS_RELEASE',
    date: new Date().toISOString(),
    previousValue: 'pending',
    newValue: 'released',
    actionStatus: 'success',
  })
  toast.push('FAAS released — visible under Clerk › Released FAAS.', 'success')
}
</script>
