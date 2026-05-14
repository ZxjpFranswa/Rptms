<template>
  <div class="space-y-6">
    <div class="card flex flex-col gap-4 md:flex-row md:items-end">
      <div class="flex-1">
        <label class="label">Search</label>
        <input v-model="q" type="search" placeholder="User, transaction type…" class="input-field dark:border-slate-600 dark:bg-slate-800 dark:text-white" />
      </div>
      <div>
        <label class="label">Status</label>
        <select v-model="statusFilter" class="select-field dark:border-slate-600 dark:bg-slate-800 dark:text-white">
          <option value="">All</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="pending">Pending</option>
        </select>
      </div>
      <button type="button" class="btn-secondary shrink-0" @click="exportCsv">Export CSV</button>
    </div>

    <div class="card">
      <DataTable :data="filtered" :columns="columns" :page-size="12">
        <template #cell-actionStatus="{ row }">
          <Badge :variant="row.actionStatus === 'success' ? 'success' : row.actionStatus === 'failed' ? 'danger' : 'info'">
            {{ row.actionStatus }}
          </Badge>
        </template>
        <template #cell-date="{ row }">
          {{ formatDate(row.date) }}
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import { useAuditLogStore } from '@/stores/auditLog'
import { useToastStore } from '@/stores/toast'
import { storeToRefs } from 'pinia'

const audit = useAuditLogStore()
const toast = useToastStore()
const { entries } = storeToRefs(audit)

const q = ref('')
const statusFilter = ref('')

const filtered = computed(() => {
  let list = entries.value
  if (statusFilter.value) {
    list = list.filter((e) => e.actionStatus === statusFilter.value)
  }
  if (q.value.trim()) {
    const s = q.value.toLowerCase()
    list = list.filter(
      (e) =>
        e.user.toLowerCase().includes(s) ||
        e.transactionType.toLowerCase().includes(s) ||
        e.previousValue.toLowerCase().includes(s) ||
        e.newValue.toLowerCase().includes(s),
    )
  }
  return list
})

const columns = [
  { key: 'user', label: 'User' },
  { key: 'transactionType', label: 'Transaction Type' },
  { key: 'date', label: 'Date' },
  { key: 'previousValue', label: 'Previous Value' },
  { key: 'newValue', label: 'New Value' },
  { key: 'actionStatus', label: 'Action Status' },
]

const formatDate = (iso: string) => new Date(iso).toLocaleString()

const exportCsv = () => {
  const header = columns.map((c) => c.label).join(',')
  const lines = filtered.value.map((e) =>
    [e.user, e.transactionType, e.date, e.previousValue, e.newValue, e.actionStatus]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const blob = new Blob([[header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `rprams-audit-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  toast.push('Audit export generated.', 'success')
}
</script>
