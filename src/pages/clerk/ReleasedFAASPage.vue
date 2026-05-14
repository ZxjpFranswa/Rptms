<template>
  <div class="space-y-4">
    <p class="text-sm text-slate-600 dark:text-slate-400">
      Records sync from Pinia when an assessor marks FAAS as <strong>released</strong> (websocket-ready architecture — events would mirror server state).
    </p>
    <div class="card">
      <DataTable :data="rows" :columns="columns" :page-size="10">
        <template #cell-releaseStatus="{ row }">
          <Badge variant="success">{{ row.releaseStatus }}</Badge>
        </template>
        <template #cell-assessedValue="{ row }">
          {{ formatMoney(row.assessedValue) }}
        </template>
        <template #row-actions="{ row }">
          <div class="flex justify-end gap-2">
            <button type="button" class="btn-secondary btn-sm" @click="print(row)">Print</button>
            <button type="button" class="btn-primary btn-sm" @click="download(row)">Download</button>
          </div>
        </template>
      </DataTable>
    </div>
  </div>

  <Modal v-model:open="printOpen" title="Print FAAS" size="lg" :show-confirm="false" cancel-label="Close">
    <div v-if="printRow" id="faas-print-area" class="space-y-2 text-sm text-slate-800 dark:text-slate-200">
      <p class="text-lg font-bold text-slate-900 dark:text-white">{{ printRow.faasNumber }}</p>
      <p>PIN: {{ printRow.pin }} · Owner: {{ printRow.ownerName }}</p>
      <p>Assessed value: {{ formatMoney(printRow.assessedValue) }}</p>
      <p>Release date: {{ printRow.releaseDate }}</p>
      <p class="pt-4 text-xs text-slate-500">Use your browser print dialog for official stationery (LGUs typically pre-print forms).</p>
      <button type="button" class="btn-primary btn-sm mt-2" @click="doPrint">Open print dialog</button>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import Modal from '@/components/Modal.vue'
import { usePropertiesStore, type ReleasedFaasRow } from '@/stores/properties'
import { useToastStore } from '@/stores/toast'

const propertiesStore = usePropertiesStore()
const toast = useToastStore()
const rows = computed(() => propertiesStore.releasedFaasRows)

const columns = [
  { key: 'faasNumber', label: 'FAAS Number' },
  { key: 'pin', label: 'PIN' },
  { key: 'ownerName', label: 'Owner Name' },
  { key: 'assessedValue', label: 'Assessed Value' },
  { key: 'releaseDate', label: 'Release Date' },
  { key: 'releaseStatus', label: 'Release Status' },
]

const formatMoney = (n: number) =>
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(n)

const printOpen = ref(false)
const printRow = ref<ReleasedFaasRow | null>(null)

const print = (row: ReleasedFaasRow) => {
  printRow.value = row
  printOpen.value = true
}

const doPrint = () => {
  window.print()
  toast.push('Print dialog opened.', 'info')
}

const download = (row: ReleasedFaasRow) => {
  const line = [
    'faasNumber',
    'pin',
    'ownerName',
    'assessedValue',
    'releaseDate',
    'releaseStatus',
    row.faasNumber,
    row.pin,
    row.ownerName,
    String(row.assessedValue),
    row.releaseDate,
    row.releaseStatus,
  ]
  const csv = `${line.slice(0, 6).join(',')}\n${line.slice(6).join(',')}\n`
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${row.faasNumber}-export.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.push(`Downloaded ${row.faasNumber}-export.csv`, 'success')
}
</script>
