<template>
  <div class="card">
    <DataTable :data="entries" :columns="columns" :page-size="12">
      <template #cell-actionStatus="{ row }">
        <Badge :variant="row.actionStatus === 'success' ? 'success' : 'danger'">{{ row.actionStatus }}</Badge>
      </template>
      <template #cell-date="{ row }">
        {{ new Date(row.date).toLocaleString() }}
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from '@/components/DataTable.vue'
import Badge from '@/components/Badge.vue'
import { useAuditLogStore } from '@/stores/auditLog'
import { storeToRefs } from 'pinia'

const audit = useAuditLogStore()
const { entries } = storeToRefs(audit)

const columns = [
  { key: 'user', label: 'User' },
  { key: 'transactionType', label: 'Transaction Type' },
  { key: 'date', label: 'Date' },
  { key: 'previousValue', label: 'Previous Value' },
  { key: 'newValue', label: 'New Value' },
  { key: 'actionStatus', label: 'Action Status' },
]
</script>
